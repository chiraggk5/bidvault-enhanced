import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Trash2, ShieldCheck, ShieldOff, Search, Users } from 'lucide-react'
import { formatDate } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    axios.get('/api/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id, username) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await axios.delete(`/api/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      toast.success('User deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleAdmin = async (id) => {
    try {
      const r = await axios.put(`/api/admin/users/${id}/toggle-admin`)
      setUsers(prev => prev.map(u => u._id === id ? r.data : u))
      toast.success(`Admin role ${r.data.isAdmin ? 'granted' : 'revoked'}`)
    } catch {
      toast.error('Update failed')
    }
  }

  const filtered = users.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-white/50 text-sm mt-1">{users.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text" placeholder="Search by username or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-panel text-center py-3">
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-xs text-white/40">Total Users</p>
        </div>
        <div className="glass-panel text-center py-3">
          <p className="text-2xl font-bold text-amber-400">{users.filter(u => u.isAdmin).length}</p>
          <p className="text-xs text-white/40">Admins</p>
        </div>
        <div className="glass-panel text-center py-3">
          <p className="text-2xl font-bold text-emerald-400">{users.filter(u => u.totalBids > 0).length}</p>
          <p className="text-xs text-white/40">Active Bidders</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-white/30 font-medium uppercase tracking-wider">
            <div className="col-span-4">User</div>
            <div className="col-span-2 text-center">Bids</div>
            <div className="col-span-2 text-center">Won</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filtered.map(u => (
            <div key={u._id} className="card p-4 grid grid-cols-12 gap-4 items-center">
              {/* User info */}
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm truncate">{u.username}</p>
                    {u.isAdmin && <span className="badge-admin text-xs"><ShieldCheck className="w-3 h-3" /> Admin</span>}
                    {u._id === me._id && <span className="badge bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">You</span>}
                  </div>
                  <p className="text-white/40 text-xs truncate">{u.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-2 text-center">
                <p className="text-white font-semibold">{u.totalBids}</p>
                <p className="text-white/30 text-xs">bids</p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-amber-400 font-semibold">{u.wonAuctions}</p>
                <p className="text-white/30 text-xs">auctions</p>
              </div>
              <div className="col-span-2">
                <p className="text-white/60 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center gap-2 justify-end">
                {u._id !== me._id && (
                  <>
                    <button
                      onClick={() => handleToggleAdmin(u._id)}
                      title={u.isAdmin ? 'Revoke admin' : 'Grant admin'}
                      className={`p-2 rounded-lg transition-all ${u.isAdmin ? 'bg-amber-500/20 text-amber-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-white/5 text-white/40 hover:bg-amber-500/20 hover:text-amber-400'}`}
                    >
                      {u.isAdmin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(u._id, u.username)}
                      disabled={deleting === u._id}
                      className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
