import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import psnLogo from '../assets/psn-logo.svg'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
    isActive
      ? 'bg-brand-500 text-white'
      : 'text-slate-600 hover:bg-slate-100'
  )

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img src={psnLogo} alt="PSN logo" className="h-9 w-9" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Play Sports Network
            </p>
            <h1 className="text-lg font-semibold">Content Performance Dashboard</h1>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <NavLink to="/insights" className={linkClass}>
            Insights
          </NavLink>
          <NavLink to="/data" className={linkClass}>
            Data
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
