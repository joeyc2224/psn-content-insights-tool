import { useQuery } from '@tanstack/react-query'
import { useFilters } from '../context/FiltersContext'
import Spinner from './Spinner'

type SummaryResponse = {
  videos: number
  views: number
  likes: number
  comments: number
  shares: number
  minutes_watched: number
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

function KpiBar() {
  const { selectedAccounts, startDate, endDate, publishedOnly } = useFilters()

  const query = useQuery({
    queryKey: ['summary', selectedAccounts, startDate, endDate, publishedOnly],
    queryFn: () => {
      const search = new URLSearchParams()
      if (selectedAccounts.length > 0) {
        search.set('accounts', selectedAccounts.join(','))
      }
      if (startDate) search.set('start_date', startDate)
      if (endDate) search.set('end_date', endDate)
      if (publishedOnly) search.set('published_only', 'true')
      return fetchJson<SummaryResponse>(`/api/summary?${search.toString()}`)
    },
  })

  const data = query.data
  const videos = data?.videos ?? 0
  const views = data?.views ?? 0
  const likes = data?.likes ?? 0
  const comments = data?.comments ?? 0
  const shares = data?.shares ?? 0
  const minutesWatched = data?.minutes_watched ?? 0

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 pb-5 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Key Metrics</h2>
          <p className="text-sm text-slate-500">
            Totals for the selected channels and date range.
          </p>
        </div>
      </div>

      {query.isLoading ? (
        <div className="mt-4 flex h-32 items-center justify-center">
          <Spinner />
        </div>
      ) : query.isError || !data ? (
        <div className="mt-4 text-sm text-red-500">Failed to load metrics.</div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase text-slate-500">Videos</p>
            <p className="text-lg font-semibold">{formatNumber(videos)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase text-slate-500">Views</p>
            <p className="text-lg font-semibold">{formatNumber(views)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase text-slate-500">Likes</p>
            <p className="text-lg font-semibold">{formatNumber(likes)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase text-slate-500">Comments</p>
            <p className="text-lg font-semibold">{formatNumber(comments)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase text-slate-500">Shares</p>
            <p className="text-lg font-semibold">{formatNumber(shares)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase text-slate-500">Minutes Watched</p>
            <p className="text-lg font-semibold">{formatNumber(minutesWatched)}</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default KpiBar
