import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DataPage from './pages/Data'
import InsightsPage from './pages/Insights'
import { FiltersProvider } from './context/FiltersContext'

function App() {
  return (
    <FiltersProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/insights" replace />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/data" element={<DataPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FiltersProvider>
  )
}

export default App
