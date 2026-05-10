import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Gavel, Users, TrendingUp, DollarSign, Activity, PlusCircle, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/format'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentAuctions, setRecentAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState([])
  const socket = useSocket()

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/stats'),
      axios.get('/api/admin/auctions')
    ]).then(([sRes, aRes]) => {
      setStats(sRes.data)
      setRecentAuctions(aRes.data.slice(0, 5))
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!socket) return
    const onBid = (data) => {
      setActivity(prev => [{
        type: 'bid',
        text: `${data.username} bid ${formatCurrency(data.amount)} on "${data.title}"`,
        time: new Date()
      }, ...prev].slice(0, 20))
      setStats(prev => prev ? { ...prev, totalBidsPlaced: prev.totalBidsPlaced + 1 } : prev)
    }
    const onEnded = (data) => {
      setActivity(prev => [{
        type: 'ended',
        text: `Auction "${data.title}" ended — Winner: ${data.winner || 'No winner'}`,
        time: new Date()
      }, ...prev].slice(0, 20))
    }
    socket.on('bid:new', onBid)
    socket.on('auction:ended', onEnded)
    return () => { socket.off('bid:new', onBid); socket.off('auction:ended', onEnded) }
  }, [socket])

  const STAT_CARDS = stats ? [
    { label: 'Total Auctions', value: stats.totalAuctions, icon: Gavel, color: 'text-purple-400', bg: 'from-purple-600/20 to-purple-900/10' },
    { label: 'Active Auctions', value: stats.activeAuctions, icon: Activity, color: 'text-emerald-400', bg: 'from-emerald-600/20 to-emerald-900/10' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'from-blue-600/20 to-blue-900/10' },
    { label: 'Bids Placed', value: stats.totalBidsPlaced, icon: TrendingUp, color: 'text-amber-400', bg: 'from-amber-600/20 to-amber-900/10' },
    { label: 'Revenue (Ended)', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-rose-400', bg: 'from-rose-600/20 to-rose-900/10' },
    { label: 'Ended Auctions', value: stats.endedAuctions, icon: Gavel, color: 'text-slate-400', bg: 'from-slate-600/20 to-slate-900/10' }
  ] : []

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">Overview of BidVault platform</p>
        </div>
        <Link to="/admin/auctions/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Auction
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`stat-card bg-gradient-to-br ${bg} border border-white/10`}>
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-white/50 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Auctions */}
        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Auctions</h2>
            <Link to="/admin/auctions" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAuctions.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-6">No auctions yet</p>
            ) : recentAuctions.map(a => (
              <div key={a._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-2xl">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{a.title}</p>
                  <p className="text-white/40 text-xs">{a.bidCount} bids · {formatCurrency(a.currentPrice)}</p>
                </div>
                <span className={`badge text-xs ${a.status === 'active' ? 'badge-active' : a.status === 'ended' ? 'badge-ended' : 'badge-cancelled'}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-panel">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-semibold text-white">Live Activity</h2>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {activity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">Waiting for activity...</p>
                <p className="text-white/20 text-xs mt-1">Bids and auction events will appear here live</p>
              </div>
            ) : activity.map((item, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-sm ${item.type === 'bid' ? 'bg-amber-500/10' : 'bg-purple-500/10'}`}>
                <span>{item.type === 'bid' ? '💰' : '🏁'}</span>
                <div>
                  <p className="text-white/80">{item.text}</p>
                  <p className="text-white/30 text-xs">{item.time.toLocaleTimeString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
