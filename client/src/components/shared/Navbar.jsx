import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Gavel, LayoutDashboard, LogOut, LogIn, UserPlus, ShieldCheck, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Gavel className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Bid<span className="text-amber-400">Vault</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/auctions" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/auctions') ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
              Auctions
            </Link>
            {user && (
              <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                My Bids
              </Link>
            )}
            {user?.isAdmin && (
              <Link to="/admin" className="px-4 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Admin
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-white/60">Hi, <span className="text-white font-medium">{user.username}</span></span>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-red-400 transition-colors px-3 py-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link to="/register" className="btn-primary text-sm flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" /> Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-4 space-y-2">
          <Link to="/auctions" className="block px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10" onClick={() => setMenuOpen(false)}>Auctions</Link>
          {user && <Link to="/dashboard" className="block px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10" onClick={() => setMenuOpen(false)}>My Bids</Link>}
          {user?.isAdmin && <Link to="/admin" className="block px-4 py-2 rounded-lg text-amber-400 hover:bg-amber-500/10" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
          <div className="pt-2 border-t border-white/10">
            {user ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg">Logout</button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1 btn-secondary text-center text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="flex-1 btn-primary text-center text-sm" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
