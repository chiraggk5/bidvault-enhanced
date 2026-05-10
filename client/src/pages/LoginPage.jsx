import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Gavel, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.username}!`)
      navigate(user.isAdmin ? '/admin' : '/auctions')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0a1a] hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Bid<span className="text-amber-400">Vault</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Welcome back</h1>
          <p className="text-white/50 mt-1">Sign in to continue bidding</p>
        </div>

        <form onSubmit={handle} className="glass-panel space-y-4">
          <div>
            <label className="text-sm text-white/60 block mb-1">Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="input-field pr-10"
                placeholder="••••••"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
            <strong>Demo Admin:</strong> admin@bidvault.com / admin123
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
          </button>

          <p className="text-center text-white/40 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">Create one free</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
