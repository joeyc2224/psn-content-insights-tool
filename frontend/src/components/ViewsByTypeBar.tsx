import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { useFilters } from '../context/FiltersContext'
import Spinner from './Spinner'

type SplitRow = {
  label: string
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

const COLORS: Record<string, string> = {
  Shorts: '#da2632',
  'Long Form': '#1e293bd8',
}

function ViewsByTypeBar() {
  const { selectedAccounts, startDate, endDate, publishedOnly } = useFilters()

  const query = useQuery({
    queryKey: ['views-split', 'video_type', selectedAccounts, startDate, endDate, publishedOnly],
    queryFn: () => {
      const search = new URLSearchParams()
      search.set('group_by', 'video_type')
      if (selectedAccounts.length > 0) {
        search.set('accounts', selectedAccounts.join(','))
      }
      if (startDate) search.set('start_date', startDate)
      if (endDate) search.set('end_date', endDate)
      if (publishedOnly) search.set('published_only', 'true')
      return fetchJson<SplitRow[]>(`/api/views-split?${search.toString()}`)
    },
  })

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 pb-5 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Views by Video Type</h2>
          <p className="text-sm text-slate-500">
            Share of total views in the selected period.
          </p>
        </div>
      </div>

      <div className="mt-4 h-64">
        {query.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : query.isError ? (
          <div className="flex h-64 items-center justify-center text-sm text-red-500">
            Failed to load chart.
          </div>
        ) : (
          (() => {
            const rows = query.data ?? []
            const total = rows.reduce((sum, row) => sum + row.views, 0)
            const data = rows.map((item) => ({
              ...item,
              percent: total > 0 ? (item.views / total) * 100 : 0,
              displayLabel: `${item.label} · ${formatNumber(item.views)}`,
              percentLabel: `${(total > 0 ? (item.views / total) * 100 : 0).toFixed(1)}%`,
            }))
            return (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 8, right: 22, left: -4, bottom: 0 }}>
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatNumber(Number(value))}
                  />
                  <YAxis dataKey="label" type="category" tick={false} axisLine tickLine width={8} />
                  <Bar dataKey="views" radius={[0, 6, 6, 0]}>
                    {data.map((entry) => (
                      <Cell key={entry.label} fill={COLORS[entry.label] ?? '#94a3b8'} />
                    ))}
                    <LabelList
                      dataKey="displayLabel"
                      position="insideLeft"
                      fill="#ffffff"
                      fontSize={12}
                      fontWeight={600}
                    />
                    <LabelList
                      dataKey="percentLabel"
                      position="right"
                      fill="#64748b"
                      fontSize={12}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          })()
        )}
      </div>
    </section>
  )
}

export default ViewsByTypeBar
