import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Spinner from './Spinner'

type VideoDetail = {
  video_id: string
  account_name: string
  published_at_date: string
  video_url: string | null
  video_type: string
  title: string
  text: string
  video_length: number | null
  thumbnail_url: string | null
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_minutes_watched: number
}

type FiltersResponse = {
  min_data_date: string | null
  max_data_date: string | null
  account_names: string[]
  video_types: string[]
}

type TrendRow = {
  video_id: string
  data_date: string
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

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const query = useQuery({
    queryKey: ['video-detail', videoId],
    queryFn: () => fetchJson<VideoDetail>(`/api/videos/${videoId}`),
  })

  const filtersQuery = useQuery({
    queryKey: ['filters'],
    queryFn: () => fetchJson<FiltersResponse>('/api/filters'),
  })

  const trendQuery = useQuery({
    queryKey: [
      'video-trend',
      videoId,
      query.data?.published_at_date,
      filtersQuery.data?.max_data_date,
    ],
    enabled: Boolean(query.data?.published_at_date && filtersQuery.data?.max_data_date),
    queryFn: () => {
      const search = new URLSearchParams()
      search.set('video_ids', videoId)
      search.set('start_date', query.data!.published_at_date)
      search.set('end_date', filtersQuery.data!.max_data_date!)
      return fetchJson<TrendRow[]>(`/api/video-trends?${search.toString()}`)
    },
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Video details"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex h-full max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-lg sm:h-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="text-lg font-semibold">Video Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {query.isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : query.isError || !query.data ? (
            <div className="text-sm text-red-500">Failed to load video.</div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div>
                {query.data.thumbnail_url ? (
                  <img
                    src={query.data.thumbnail_url}
                    alt={query.data.title}
                    className="w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                    No thumbnail
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">{query.data.account_name}</p>
                  <h4 className="text-xl font-semibold">{query.data.title}</h4>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <span>{query.data.video_type}</span>
                  <span>•</span>
                  <span>{query.data.published_at_date}</span>
                  <span>•</span>
                  <span>
                    {query.data.video_length ? formatDuration(query.data.video_length) : '—'}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-xs uppercase text-slate-500">Views</p>
                    <p className="font-semibold">{formatNumber(query.data.total_views)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-xs uppercase text-slate-500">Likes</p>
                    <p className="font-semibold">{formatNumber(query.data.total_likes)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-xs uppercase text-slate-500">Comments</p>
                    <p className="font-semibold">{formatNumber(query.data.total_comments)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-xs uppercase text-slate-500">Shares</p>
                    <p className="font-semibold">{formatNumber(query.data.total_shares)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-xs uppercase text-slate-500">Minutes Watched</p>
                    <p className="font-semibold">{formatNumber(query.data.total_minutes_watched)}</p>
                  </div>
                </div>
                {query.data.video_url && (
                  <a
                    href={query.data.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-brand-500 hover:text-brand-500/80"
                  >
                    Open on YouTube →
                  </a>
                )}
              </div>
              </div>
              <div className="mt-6 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Daily Views</p>
                <p className="text-xs text-slate-500">
                  {query.data.published_at_date} → {filtersQuery.data?.max_data_date ?? '—'}
                </p>
              </div>
              <div className="mt-4 h-56">
                {trendQuery.isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Spinner size={20} />
                  </div>
                ) : trendQuery.isError ? (
                  <div className="flex h-full items-center justify-center text-xs text-red-500">
                    Failed to load trend.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendQuery.data ?? []} margin={{ top: 4, right: 8, left: -6, bottom: 0 }}>
                      <XAxis
                        dataKey="data_date"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => formatDate(String(value))}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => formatNumber(Number(value))}
                      />
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#e62533"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoModal
