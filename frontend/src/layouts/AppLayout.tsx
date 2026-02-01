import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import psnLogo from '../assets/psn-logo.svg'
import { useFilters } from '../context/FiltersContext'

type FiltersResponse = {
  min_data_date: string | null
  max_data_date: string | null
  account_names: string[]
  video_types: string[]
}

const fetchJson = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return res.json()
}

function AppLayout() {
  const {
    startDate,
    endDate,
    selectedAccounts,
    publishedOnly,
    setStartDate,
    setEndDate,
    setSelectedAccounts,
    setPublishedOnly,
  } = useFilters()

  const filtersQuery = useQuery({
    queryKey: ['filters'],
    queryFn: () => fetchJson<FiltersResponse>('/api/filters'),
  })

  const accounts = filtersQuery.data?.account_names ?? []
  const minDate = filtersQuery.data?.min_data_date ?? ''
  const maxDate = filtersQuery.data?.max_data_date ?? ''

  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!filtersQuery.data) return

    if (!hasInitialized.current && !startDate && !endDate && maxDate) {
      const max = new Date(maxDate)
      const start = new Date(max)
      start.setDate(start.getDate() - 29)
      setStartDate(start.toISOString().slice(0, 10))
      setEndDate(max.toISOString().slice(0, 10))
      hasInitialized.current = true
      return
    }

    hasInitialized.current = true

    if (!startDate && minDate) setStartDate(minDate)
    if (!endDate && maxDate) setEndDate(maxDate)
  }, [filtersQuery.data, startDate, endDate, minDate, maxDate, setStartDate, setEndDate])

  const toggleAccount = (account: string) => {
    if (selectedAccounts.includes(account)) {
      setSelectedAccounts(selectedAccounts.filter((item) => item !== account))
      return
    }
    setSelectedAccounts([...selectedAccounts, account])
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur md:sticky md:top-0 md:z-10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-4 px-6 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Filters
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Channels</span>
              {filtersQuery.isLoading ? (
                <span className="text-sm text-slate-500">Loading...</span>
              ) : filtersQuery.isError ? (
                <span className="text-sm text-red-500">Failed to load</span>
              ) : accounts.length === 0 ? (
                <span className="text-sm text-slate-500">None</span>
              ) : (
                <details className="relative">
                  <summary className="cursor-pointer list-none rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                    {selectedAccounts.length > 0 ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="max-w-[140px] truncate">
                          {selectedAccounts[0]}
                        </span>
                        {selectedAccounts.length > 1 && (
                          <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-semibold text-brand-500">
                            +{selectedAccounts.length - 1}
                          </span>
                        )}
                      </span>
                    ) : (
                      'All channels'
                    )}
                  </summary>
                  <div className="absolute left-0 top-10 z-20 w-60 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="max-h-48 overflow-y-auto">
                      {accounts.map((account) => (
                        <label
                          key={account}
                          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                            checked={selectedAccounts.includes(account)}
                            onChange={() => toggleAccount(account)}
                          />
                          {account}
                        </label>
                      ))}
                    </div>
                  </div>
                </details>
              )}
            </div>

            <div className="hidden h-5 w-px bg-slate-200 sm:block" />

            <label className="text-sm font-medium text-slate-600">
              Start
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value || minDate)}
                className="ml-2 rounded-md border border-slate-200 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              End
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value || maxDate)}
                className="ml-2 rounded-md border border-slate-200 px-2 py-1 text-sm"
              />
            </label>

            <div className="hidden h-5 w-px bg-slate-200 sm:block" />

            <label
              className="flex items-center gap-2 text-sm font-medium text-slate-600"
              title="When enabled, counts only videos published in the selected date range."
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                checked={publishedOnly}
                onChange={(event) => setPublishedOnly(event.target.checked)}
              />
              Published in range only
            </label>
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl px-6 py-6">
        <Outlet />
      </main>
      <footer className="mt-6 border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img
              src={psnLogo}
              alt="PSN logo"
              className="h-6 w-6 grayscale"
            />
            <span>Play Sports Network</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Junior Full Stack Developer – Technical Exercise</span>
            <span className="text-slate-300">•</span>
            <a
              href="https://github.com/joeyc2224/psn-content-insights-tool"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-600 hover:text-slate-900"
            >
              by Joe Crosby
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
