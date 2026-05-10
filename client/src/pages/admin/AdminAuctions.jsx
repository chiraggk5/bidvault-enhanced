import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PlusCircle, Edit, Trash2, XCircle, Crown, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/format'
import CountdownTimer from '../../components/shared/CountdownTimer'

export default function AdminAuctions() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const r = await axios.get('/api/admin/auctions')
      setAuctions(r.data)
    } catch {
      toast.error('Failed to load auctions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await axios.delete(`/api/admin/auctions/${id}`)
      setAuctions(prev => prev.filter(a => a._id !== id))
      toast.success('Auction deleted')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const handleCancel = async (id, title) => {
    if (!confirm(`Cancel "${title}"? Bidders will be notified.`)) return
    try {
      const r = await axios.post(`/api/admin/auctions/${id}/cancel`)
      setAuctions(prev => prev.map(a => a._id === id ? r.data : a))
      toast.success('Auction cancelled')
    } catch {
      toast.error('Cancel failed')
    }
  }

  const handleToggleFeatured = async (auction) => {
    try {
      const r = await axios.put(`/api/admin/auctions/${auction._id}`, { isFeatured: !auction.isFeatured })
      setAuctions(prev => prev.map(a => a._id === auction._id ? r.data : a))
      toast.success(`${r.data.isFeatured ? 'Featured' : 'Unfeatured'} auction`)
    } catch {
      toast.error('Update failed')
    }
  }

  const filtered = auctions.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || a.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Auctions</h1>
          <p className="text-white/50 text-sm mt-1">{auctions.length} total auctions</p>
        </div>
        <Link to="/admin/auctions/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Create Auction
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text" placeholder="Search auctions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input-field w-40 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-white/50">No auctions match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a._id} className="card p-4 flex items-center gap-4 flex-wrap">
              <span className="text-3xl flex-shrink-0">{a.emoji}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-white truncate">{a.title}</h3>
                  <span className={`badge text-xs ${a.status === 'active' ? 'badge-active' : a.status === 'ended' ? 'badge-ended' : 'badge-cancelled'}`}>
                    {a.status}
                  </span>
                  {a.isFeatured && <span className="badge-featured text-xs">Featured</span>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-white/40 flex-wrap">
                  <span>{a.category}</span>
                  <span>{formatCurrency(a.currentPrice)}</span>
                  <span>{a.bidCount} bids</span>
                  {a.leadingBidder && <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-amber-400" />{a.leadingBidder}</span>}
                  <span>Ends: {formatDate(a.endsAt)}</span>
                  {a.status === 'active' && <CountdownTimer endsAt={a.endsAt} compact />}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleFeatured(a)}
                  title={a.isFeatured ? 'Unfeature' : 'Feature'}
                  className={`p-2 rounded-lg transition-all text-sm ${a.isFeatured ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-white/5 text-white/40 hover:text-amber-400 hover:bg-amber-500/10'}`}
                >
                  ⭐
                </button>
                <Link to={`/admin/auctions/edit/${a._id}`} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                  <Edit className="w-4 h-4" />
                </Link>
                {a.status === 'active' && (
                  <button onClick={() => handleCancel(a._id, a.title)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-orange-400 hover:bg-orange-500/10 transition-all">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(a._id, a.title)}
                  disabled={deleting === a._id}
                  className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
