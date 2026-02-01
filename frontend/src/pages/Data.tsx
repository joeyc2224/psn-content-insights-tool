import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFilters } from '../context/FiltersContext'
import Spinner from '../components/Spinner'
import VideoModal from '../components/VideoModal'

type VideoRow = {
  video_id: string
  title: string
  account_name: string
  video_type: string
  published_at_date: string
  thumbnail_url: string | null
  video_length: number | null
  views_period: number
  likes_period: number
  comments_period: number
  shares_period: number
  views_total: number
  engagement_rate: number
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

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

type SortKey =
  | 'views_period'
  | 'views_total'
  | 'published_at_date'
  | 'likes_period'
  | 'comments_period'

function DataPage() {
  const { selectedAccounts, startDate, endDate, publishedOnly } = useFilters()
  const [sortKey, setSortKey] = useState<SortKey>('views_period')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [videoType, setVideoType] = useState<'all' | 'Shorts' | 'Long Form'>('all')

  const query = useQuery({
    queryKey: [
      'videos-table',
      selectedAccounts,
      startDate,
      endDate,
      publishedOnly,
      videoType,
    ],
    queryFn: () => {
      const search = new URLSearchParams()
      if (selectedAccounts.length > 0) {
        search.set('accounts', selectedAccounts.join(','))
      }
      if (videoType !== 'all') {
        search.set('video_type', videoType)
      }
      if (startDate) search.set('start_date', startDate)
      if (endDate) search.set('end_date', endDate)
      if (publishedOnly) search.set('published_only', 'true')
      return fetchJson<VideoRow[]>(`/api/videos-table?${search.toString()}`)
    },
  })
  useEffect(() => {
    setPage(1)
  }, [selectedAccounts, startDate, endDate, publishedOnly, sortKey, sortDir, videoType])

  const sortedRows = useMemo(() => {
    const rows = query.data ?? []
    const sorted = [...rows].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]
      if (aValue === bValue) return 0
      if (sortDir === 'asc') return aValue > bValue ? 1 : -1
      return aValue < bValue ? 1 : -1
    })
    return sorted
  }, [query.data, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const pagedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize)

  const setSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('desc')
  }

  const sortLabel = (key: SortKey) => {
    if (sortKey !== key) return '↕'
    return sortDir === 'asc' ? '↑' : '↓'
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white px-5 pb-5 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Video Library</h2>
            <p className="text-sm text-slate-500">
              Sorted by views in the selected period by default.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-xs uppercase tracking-wide text-slate-400">Type</span>
            <select
              className="rounded-md border border-slate-200 px-2 py-1 text-sm"
              value={videoType}
              onChange={(event) => setVideoType(event.target.value as 'all' | 'Shorts' | 'Long Form')}
            >
              <option value="all">All</option>
              <option value="Shorts">Shorts</option>
              <option value="Long Form">Long Form</option>
            </select>
          </div>
        </div>

        {query.isLoading ? (
          <div className="mt-4 flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : query.isError ? (
          <div className="mt-4 text-sm text-red-500">
            Failed to load videos.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-2 py-2">Video</th>
                  <th className="px-2 py-2">Channel</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Length</th>
                  <th
                    className="px-2 py-2 cursor-pointer select-none"
                    onClick={() => setSort('views_period')}
                  >
                    Views (Period) {sortLabel('views_period')}
                  </th>
                  <th
                    className="px-2 py-2 cursor-pointer select-none"
                    onClick={() => setSort('views_total')}
                  >
                    Views (Total) {sortLabel('views_total')}
                  </th>
                  <th
                    className="px-2 py-2 cursor-pointer select-none"
                    onClick={() => setSort('likes_period')}
                  >
                    Likes {sortLabel('likes_period')}
                  </th>
                  <th
                    className="px-2 py-2 cursor-pointer select-none"
                    onClick={() => setSort('comments_period')}
                  >
                    Comments {sortLabel('comments_period')}
                  </th>
                  <th
                    className="px-2 py-2 cursor-pointer select-none"
                    onClick={() => setSort('published_at_date')}
                  >
                    Published {sortLabel('published_at_date')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr
                    key={row.video_id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setActiveVideo(row.video_id)}
                  >
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        {row.thumbnail_url ? (
                          <img
                            src={row.thumbnail_url}
                            alt={row.title}
                            className="h-8 w-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-8 w-12 rounded-md bg-slate-100" />
                        )}
                        <div>
                          <p className="max-w-[220px] truncate font-semibold text-slate-800">
                            {row.title}
                          </p>
                          <p className="text-xs text-slate-400">{row.video_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-slate-600">{row.account_name}</td>
                    <td className="px-2 py-3 text-slate-600">{row.video_type}</td>
                    <td className="px-2 py-3 text-slate-600">
                      {row.video_length ? formatDuration(row.video_length) : '—'}
                    </td>
                    <td className="px-2 py-3 font-semibold">
                      {formatNumber(row.views_period)}
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {formatNumber(row.views_total)}
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {formatNumber(row.likes_period)}
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {formatNumber(row.comments_period)}
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {row.published_at_date}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <span>
              Page {page} of {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                disabled={page === pageCount}
                className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            </div>
            </div>
        )}
      </div>
      {activeVideo && (
        <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </section>
  )
}

export default DataPage
