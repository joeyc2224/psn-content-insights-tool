import { createContext, useContext, useMemo, useState } from 'react'

type FiltersState = {
  startDate: string
  endDate: string
  selectedAccounts: string[]
  publishedOnly: boolean
  hoverPublishDate: string | null
  setStartDate: (value: string) => void
  setEndDate: (value: string) => void
  setSelectedAccounts: (value: string[]) => void
  setPublishedOnly: (value: boolean) => void
  setHoverPublishDate: (value: string | null) => void
}

const FiltersContext = createContext<FiltersState | undefined>(undefined)

export const FiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [publishedOnly, setPublishedOnly] = useState(false)
  const [hoverPublishDate, setHoverPublishDate] = useState<string | null>(null)

  const value = useMemo(
    () => ({
      startDate,
      endDate,
      selectedAccounts,
      publishedOnly,
      hoverPublishDate,
      setStartDate,
      setEndDate,
      setSelectedAccounts,
      setPublishedOnly,
      setHoverPublishDate,
    }),
    [startDate, endDate, selectedAccounts, publishedOnly, hoverPublishDate]
  )

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export const useFilters = () => {
  const context = useContext(FiltersContext)
  if (!context) {
    throw new Error('useFilters must be used within FiltersProvider')
  }
  return context
}
