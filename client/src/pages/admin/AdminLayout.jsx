import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Gavel, Users, PlusCircle, LogOut, ShieldCheck, ChevronRight } from 'lucide-react'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/auctions', icon: Gavel, label: 'Auctions' },
  { to: '/admin/auctions/new', icon: PlusCircle, label: 'Create Auction' },
  { to: '/admin/users', icon: Users, label: 'Users' }
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to) && !(exact && location.pathname !== to)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-[#0f0a1a] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black/40 border-r border-white/10 flex flex-col fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Gavel className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Bid<span className="text-amber-400">Vault</span></span>
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, exact }) => {
            const active = exact ? location.pathname === to : location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-sm font-bold">
              {user?.username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.username}</p>
              <p className="text-white/40 text-xs">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-white/50 hover:text-red-400 transition-colors px-2 py-2 rounded-lg hover:bg-red-500/10">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
