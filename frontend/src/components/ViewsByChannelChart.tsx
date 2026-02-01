import { useLayoutEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts'
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

const TooltipContent = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) => {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-slate-700">{item.name}</div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="text-slate-500">Views</span>
        <span className="font-semibold text-slate-800">
          {formatNumber(Number(item.value))}
        </span>
      </div>
    </div>
  )
}

function ViewsByChannelChart() {
  const { selectedAccounts, startDate, endDate, publishedOnly } = useFilters()

  const query = useQuery({
    queryKey: ['views-split', 'account', selectedAccounts, startDate, endDate, publishedOnly],
    queryFn: () => {
      const search = new URLSearchParams()
      search.set('group_by', 'account')
      if (selectedAccounts.length > 1) {
        search.set('accounts', selectedAccounts.join(','))
      }
      if (selectedAccounts.length === 1) {
        search.set('include_all', 'true')
      }
      if (startDate) search.set('start_date', startDate)
      if (endDate) search.set('end_date', endDate)
      if (publishedOnly) search.set('published_only', 'true')
      return fetchJson<SplitRow[]>(`/api/views-split?${search.toString()}`)
    },
  })

  const data = (query.data ?? []).map((item) => ({
    ...item,
    label: item.label.trim(),
  }))
  const selectedLabel =
    selectedAccounts.length === 1 ? selectedAccounts[0].trim() : null
  const total = data.reduce((sum, item) => sum + item.views, 0)
  const colors = data.map((_, index) => {
    const hue = (index * 137.508) % 360
    return `hsl(${hue} 67% 50%)`
  })

  const listRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const lastScrolledRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (!selectedLabel) return
    if (lastScrolledRef.current === selectedLabel) return

    const el = itemRefs.current[selectedLabel]
    const container = listRef.current
    if (!el || !container) return

    const containerTop = container.scrollTop
    const containerBottom = containerTop + container.clientHeight
    const elTop = el.offsetTop - container.offsetTop
    const elBottom = elTop + el.clientHeight

    if (elTop >= containerTop && elBottom <= containerBottom) {
      lastScrolledRef.current = selectedLabel
      return
    }

    const scrollMargin = 16
    const target =
      elTop - container.clientHeight / 2 + el.clientHeight / 2 - scrollMargin
    container.scrollTo({ top: target, behavior: 'smooth' })
    lastScrolledRef.current = selectedLabel
  }, [selectedLabel, data.length])

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 pb-5 pt-4">
      <div>
        <h2 className="text-lg font-semibold">Views by Channel</h2>
        <p className="text-sm text-slate-500">
          Total views per channel in the selected period.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr]">
        {query.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : query.isError ? (
          <div className="flex h-64 items-center justify-center text-sm text-red-500">
            Failed to load chart.
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<TooltipContent />} />
                  <Pie
                    data={data}
                    dataKey="views"
                    nameKey="label"
                    innerRadius={45}
                    outerRadius={90}
                    stroke="transparent"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.map((entry, index) => (
                      <Cell key={entry.label} fill={colors[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              ref={listRef}
              className="flex h-64 flex-col items-start gap-3 overflow-y-auto pr-1"
            >
              {data.map((entry, index) => {
                const percent = total > 0 ? (entry.views / total) * 100 : 0
                return (
                  <div
                    key={entry.label}
                    ref={(el) => {
                      itemRefs.current[entry.label] = el
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                      selectedLabel && entry.label === selectedLabel
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="max-w-[120px] truncate font-semibold text-slate-700">
                        {entry.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">
                        {formatNumber(entry.views)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {percent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default ViewsByChannelChart
