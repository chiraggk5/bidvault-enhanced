import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react'
import Navbar from '../components/shared/Navbar'
import AuctionCard from '../components/user/AuctionCard'
import { CATEGORIES } from '../utils/format'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const socket = useSocket()

  const fetchAuctions = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (category) params.category = category
      if (search) params.search = search
      const r = await axios.get('/api/auctions', { params })
      setAuctions(r.data)
    } catch {
      toast.error('Failed to load auctions')
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => {
    const id = setTimeout(fetchAuctions, 300)
    return () => clearTimeout(id)
  }, [fetchAuctions])

  // Real-time updates
  useEffect(() => {
    if (!socket) return
    const onBid = (data) => {
      setAuctions(prev => prev.map(a =>
        a._id === data.auctionId
          ? { ...a, currentPrice: data.currentPrice, bidCount: data.bidCount, leadingBidder: data.username }
          : a
      ))
    }
    const onNew = (auction) => {
      setAuctions(prev => [auction, ...prev])
      toast.success(`New auction: ${auction.title}`)
    }
    const onEnded = (data) => {
      setAuctions(prev => prev.filter(a => a._id !== data.auctionId))
    }
    socket.on('bid:new', onBid)
    socket.on('auction:new', onNew)
    socket.on('auction:ended', onEnded)
    return () => { socket.off('bid:new', onBid); socket.off('auction:new', onNew); socket.off('auction:ended', onEnded) }
  }, [socket])

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Live Auctions</h1>
          <p className="text-white/50">Browse and bid on active listings — updated in real-time</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input-field pl-10 pr-8 appearance-none w-full sm:w-48 cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.label} value={c.label}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <button onClick={fetchAuctions} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!category ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
          >All</button>
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              onClick={() => setCategory(category === c.label ? '' : c.label)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${category === c.label ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
            >{c.emoji} {c.label}</button>
          ))}
        </div>

        {/* Auction grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-40 bg-white/5 rounded-t-2xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-full"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No auctions found</h3>
            <p className="text-white/50">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-sm mb-4">{auctions.length} auction{auctions.length !== 1 ? 's' : ''} found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {auctions.map(a => <AuctionCard key={a._id} auction={a} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
