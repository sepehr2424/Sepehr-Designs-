import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Building2,
  CalendarClock,
  CalendarX2,
  Clock,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAdminAuth } from '../../context/AdminAuthProvider'

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarClock },
  { to: '/admin/services', label: 'Services', icon: Building2 },
  { to: '/admin/business-hours', label: 'Business Hours', icon: Clock },
  { to: '/admin/blocked-dates', label: 'Blocked Dates', icon: CalendarX2 },
  { to: '/admin/settings', label: 'Business Settings', icon: Settings },
]

export function AdminLayout() {
  const { signOut, user } = useAdminAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = (
    <>
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold-light">
          <Key size={16} />
        </span>
        <div>
          <p className="font-display text-sm font-medium text-white">Meridian</p>
          <p className="text-xs text-stone-400">Property Manager</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="truncate px-2 text-xs text-stone-500">{user?.email}</p>
        <button
          onClick={signOut}
          className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-400 transition hover:bg-white/5 hover:text-stone-200"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy-dark lg:flex">{NavContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-navy-dark">{NavContent}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <div className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 lg:hidden">
          <span className="font-display text-base font-medium text-charcoal">Meridian Admin</span>
          <button onClick={() => setMobileOpen((v) => !v)} className="text-charcoal">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
