import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFilters } from '../context/FiltersContext'
import Spinner from './Spinner'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ViewsRow = {
  data_date: string
  account_name?: string
  video_type?: string
  views: number
}


const fetchJson = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return res.json()
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

const formatDateLong = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))

const TooltipContent = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
  label?: string
}) => {
  if (!active || !payload || payload.length === 0) return null
  const total = payload.reduce((sum, item) => sum + Number(item.value || 0), 0)
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-slate-700">
        {label ? formatDateLong(label) : ''}
      </div>
      <div className="mt-2 space-y-1">
        {payload
          .map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <span className="text-slate-500">{item.name}</span>
              <span className="font-semibold text-slate-800">
                {formatNumber(Number(item.value))}
              </span>
            </div>
          ))}
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-500">Total</span>
          <span className="font-semibold text-slate-800">
            {formatNumber(total)}
          </span>
        </div>
      </div>
    </div>
  )
}

const buildQuery = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })
  return search.toString()
}

function ViewsOverTimeChart() {
  const { selectedAccounts, startDate, endDate, publishedOnly, hoverPublishDate } =
    useFilters()

  const viewsQuery = useQuery({
    queryKey: [
      'views-over-time',
      'video_type',
      selectedAccounts,
      startDate,
      endDate,
      publishedOnly,
    ],
    queryFn: () => {
      const query = buildQuery({
        group_by: 'video_type',
        accounts: selectedAccounts.length > 0 ? selectedAccounts.join(',') : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        published_only: publishedOnly ? 'true' : undefined,
      })
      return fetchJson<ViewsRow[]>(`/api/views-over-time?${query}`)
    },
  })

  const chartData = useMemo(() => {
    const rows = viewsQuery.data ?? []
    const grouped = new Map<string, Record<string, string | number>>()
    const seriesKeys = new Set<string>()

    rows.forEach((row) => {
      const key = row.data_date
      if (!grouped.has(key)) {
        grouped.set(key, { data_date: row.data_date })
      }
      const label = row.video_type
      if (label) {
        seriesKeys.add(label)
        grouped.get(key)![label] = row.views
      }
    })

    return {
      data: Array.from(grouped.values()),
      keys: Array.from(seriesKeys),
    }
  }, [viewsQuery.data])

  const xTickInterval = useMemo(() => {
    const points = chartData.data.length
    if (points <= 12) return 0
    return Math.max(1, Math.floor(points / 12))
  }, [chartData.data.length])

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 pb-5 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Total Views Over Time</h2>
          <p className="text-sm text-slate-500">
            Daily total views, split by video type.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500"></span>
            Shorts
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900"></span>
            Long Form
          </div>
        </div>
      </div>

      <div className="mt-4 h-80">
        {viewsQuery.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : viewsQuery.isError ? (
          <div className="flex h-full items-center justify-center text-sm text-red-500">
            Failed to load chart data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData.data}
              margin={{ top: 0, right: 16, left: -12, bottom: 0 }}
            >
              <XAxis
                dataKey="data_date"
                tick={{ fontSize: 12 }}
                padding={{ left: 0, right: 0 }}
                tickFormatter={(value) => formatDate(String(value))}
                interval={xTickInterval}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
                width={48}
              />
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              {hoverPublishDate && (
                <ReferenceLine
                  x={hoverPublishDate}
                  stroke="#e62533"
                  strokeDasharray="3 3"
                />
              )}
              <Tooltip content={<TooltipContent />} />
              {chartData.keys.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  strokeWidth={2}
                  stroke={key === 'Shorts' ? '#e62533' : '#0f172a'}
                  fill={key === 'Shorts' ? '#e62533' : '#0f172a'}
                  fillOpacity={0.15}
                  stackId="views"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default ViewsOverTimeChart
