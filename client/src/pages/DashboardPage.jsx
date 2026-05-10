import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/shared/Navbar'
import { Crown, TrendingUp, Gavel, Trophy, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/format'
import CountdownTimer from '../components/shared/CountdownTimer'

export default function DashboardPage() {
  const { user } = useAuth()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    axios.get('/api/auctions/my/bids')
      .then(r => setBids(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const won = bids.filter(b => b.isWinner)
  const active = bids.filter(b => b.status === 'active')
  const leading = bids.filter(b => b.isLeading && b.status === 'active')

  const filtered = {
    all: bids,
    active,
    won,
    leading
  }[tab]

  const stats = [
    { label: 'Total Bids Placed', value: user?.totalBids || 0, icon: Gavel, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Auctions Won', value: user?.wonAuctions || 0, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Active Bids', value: active.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Currently Leading', value: leading.length, icon: Crown, color: 'text-blue-400', bg: 'bg-blue-500/10' }
  ]

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-2xl font-bold text-white">
            {user?.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.username}!</h1>
            <p className="text-white/50 text-sm">{user?.email} · Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl w-fit">
          {[
            { key: 'all', label: 'All Bids' },
            { key: 'active', label: `Active (${active.length})` },
            { key: 'leading', label: `Leading (${leading.length})` },
            { key: 'won', label: `Won (${won.length})` }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-purple-600 text-white' : 'text-white/50 hover:text-white'}`}
            >{t.label}</button>
          ))}
        </div>

        {/* Bid list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse h-20"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">
              {tab === 'won' ? '🏆' : tab === 'leading' ? '👑' : '🎯'}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {tab === 'won' ? "You haven't won any auctions yet" : tab === 'leading' ? "You're not leading any bids" : "No bids yet"}
            </h3>
            <p className="text-white/50 text-sm mb-6">
              {tab === 'won' ? 'Keep bidding — your win is coming!' : 'Head over to live auctions and start bidding'}
            </p>
            <Link to="/auctions" className="btn-primary inline-flex items-center gap-2">
              <Gavel className="w-4 h-4" /> Browse Auctions
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(bid => (
              <Link
                key={bid._id}
                to={`/auctions/${bid._id}`}
                className="card p-4 flex items-center gap-4 hover:border-purple-500/30 transition-all group"
              >
                <div className="text-3xl">{bid.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors truncate">{bid.title}</h3>
                    {bid.isWinner && <span className="badge-featured text-xs"><Crown className="w-3 h-3" /> Won</span>}
                    {bid.isLeading && bid.status === 'active' && <span className="badge-active text-xs"><CheckCircle className="w-3 h-3" /> Leading</span>}
                    <span className={`badge text-xs ${bid.status === 'active' ? 'badge-active' : bid.status === 'ended' ? 'badge-ended' : 'badge-cancelled'}`}>
                      {bid.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                    <span>My bid: <span className="text-white font-semibold">{formatCurrency(bid.myHighestBid)}</span></span>
                    <span>Current: <span className="text-amber-400 font-semibold">{formatCurrency(bid.currentPrice)}</span></span>
                    {bid.status === 'active' && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <CountdownTimer endsAt={bid.endsAt} compact />
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
