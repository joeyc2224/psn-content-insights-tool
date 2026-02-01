import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useFilters } from '../context/FiltersContext'
import Spinner from './Spinner'
import VideoModal from './VideoModal'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

type TopVideoRow = {
  video_id: string
  title: string
  account_name: string
  video_type: string
  published_at_date: string
  thumbnail_url: string | null
  video_length: number | null
  views_period: number
  views_total: number
  percent_of_period_total: number
  engagement_rate: number
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

const formatPercent = (value: number) => `${value.toFixed(2)}%`

function TopVideosTable() {
  const {
    selectedAccounts,
    startDate,
    endDate,
    publishedOnly,
    setHoverPublishDate,
  } = useFilters()
  const [videoType, setVideoType] = useState<'all' | 'Shorts' | 'Long Form'>('all')
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  const tableQuery = useQuery({
    queryKey: [
      'top-videos-table',
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
      return fetchJson<TopVideoRow[]>(`/api/top-videos-table?${search.toString()}`)
    },
  })

  const videoIds = useMemo(
    () => (tableQuery.data ?? []).map((row) => row.video_id),
    [tableQuery.data]
  )

  const trendsQuery = useQuery({
    queryKey: ['video-trends', videoIds, startDate, endDate],
    enabled: videoIds.length > 0,
    queryFn: () => {
      const search = new URLSearchParams()
      search.set('video_ids', videoIds.join(','))
      if (startDate) search.set('start_date', startDate)
      if (endDate) search.set('end_date', endDate)
      return fetchJson<TrendRow[]>(`/api/video-trends?${search.toString()}`)
    },
  })

  const trendsByVideo = useMemo(() => {
    const map = new Map<string, TrendRow[]>()
    ;(trendsQuery.data ?? []).forEach((row) => {
      if (!map.has(row.video_id)) {
        map.set(row.video_id, [])
      }
      map.get(row.video_id)!.push(row)
    })
    return map
  }, [trendsQuery.data])

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 pb-5 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Top Videos</h2>
          <p className="text-sm text-slate-500">
            Ranked by views in the selected date range.
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

      {tableQuery.isLoading ? (
        <div className="mt-4 flex h-48 items-center justify-center">
          <Spinner />
        </div>
      ) : tableQuery.isError ? (
        <div className="mt-4 text-sm text-red-500">Failed to load videos.</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-2 py-2">Video</th>
                <th className="px-2 py-2">Channel</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Published</th>
                <th className="px-2 py-2">Views</th>
                <th className="px-2 py-2">Trend</th>
                <th className="px-2 py-2">Views (Total)</th>
                <th className="px-2 py-2">% of Period</th>
                <th className="px-2 py-2">Like Rate</th>
              </tr>
            </thead>
            <tbody>
              {(tableQuery.data ?? []).map((row) => {
                const trendData = trendsByVideo.get(row.video_id) ?? []
                return (
                  <tr
                    key={row.video_id}
                    className="border-b border-slate-100 cursor-pointer hover:bg-slate-50"
                    onMouseEnter={() => setHoverPublishDate(row.published_at_date)}
                    onMouseLeave={() => setHoverPublishDate(null)}
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
                      {row.published_at_date}
                    </td>
                    <td className="px-2 py-3 font-semibold">
                      {formatNumber(row.views_period)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="relative h-10 w-24 overflow-visible">
                        {trendData.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={trendData}
                              margin={{ top: 2, bottom: 2, left: 2, right: 1 }}
                            >
                              <XAxis dataKey="data_date" hide />
                              <YAxis hide domain={['dataMin', 'dataMax']} />
                              <Line
                                type="monotone"
                                dataKey="views"
                                stroke="#0f172a"
                                strokeWidth={2}
                                dot={false}
                                activeDot={false}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {formatNumber(row.views_total)}
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {formatPercent(row.percent_of_period_total)}
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {(row.engagement_rate * 100).toFixed(2)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 text-right text-sm">
        <Link
          to="/data"
          className="font-semibold text-brand-500 hover:text-brand-500/80"
        >
          View full data table →
        </Link>
      </div>
      {activeVideo && (
        <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </section>
  )
}

export default TopVideosTable
