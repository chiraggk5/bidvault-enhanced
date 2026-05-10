import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Users, Clock, Flame, CheckCircle, Crown, TrendingUp, Plus } from 'lucide-react'
import Navbar from '../components/shared/Navbar'
import CountdownTimer from '../components/shared/CountdownTimer'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/format'

export default function AuctionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const socket = useSocket()
  const [auction, setAuction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [placing, setPlacing] = useState(false)
  const [bidFlash, setBidFlash] = useState(false)
  const bidsRef = useRef(null)

  useEffect(() => {
    axios.get(`/api/auctions/${id}`)
      .then(r => {
        setAuction(r.data)
        setBidAmount(String(r.data.currentPrice + (r.data.minBidIncrement || 100)))
      })
      .catch(() => { toast.error('Auction not found'); navigate('/auctions') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  // Real-time bid updates
  useEffect(() => {
    if (!socket || !auction) return
    const onBid = (data) => {
      if (data.auctionId !== id) return
      setAuction(prev => ({
        ...prev,
        currentPrice: data.currentPrice,
        bidCount: data.bidCount,
        leadingBidder: data.username,
        bids: [{ username: data.username, amount: data.amount, placedAt: new Date() }, ...(prev.bids || []).slice(0, 49)]
      }))
      setBidFlash(true)
      setTimeout(() => setBidFlash(false), 1000)
      setBidAmount(String(data.currentPrice + (auction.minBidIncrement || 100)))
      if (bidsRef.current) bidsRef.current.scrollTop = 0
    }
    const onEnded = (data) => {
      if (data.auctionId !== id) return
      setAuction(prev => ({ ...prev, status: 'ended', winner: data.winner, currentPrice: data.finalPrice }))
      toast.success(data.winner === user?.username ? '🏆 You won this auction!' : `Auction ended. Winner: ${data.winner || 'No winner'}`)
    }
    socket.on('bid:new', onBid)
    socket.on('auction:ended', onEnded)
    return () => { socket.off('bid:new', onBid); socket.off('auction:ended', onEnded) }
  }, [socket, auction, id, user])

  const placeBid = async () => {
    if (!user) { toast.error('Please login to bid'); navigate('/login'); return }
    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount <= auction.currentPrice) {
      toast.error(`Bid must be higher than ${formatCurrency(auction.currentPrice)}`)
      return
    }
    setPlacing(true)
    try {
      await axios.post(`/api/auctions/${id}/bid`, { amount })
      toast.success(`Bid of ${formatCurrency(amount)} placed!`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place bid')
    } finally {
      setPlacing(false)
    }
  }

  const quickBid = (increment) => {
    if (!auction) return
    setBidAmount(String(auction.currentPrice + increment))
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!auction) return null

  const gradient = CATEGORY_COLORS[auction.category] || 'from-purple-600 to-violet-600'
  const isLeading = auction.leadingBidder === user?.username
  const isWinner = auction.winner === user?.username
  const minBid = auction.currentPrice + (auction.minBidIncrement || 100)

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Back */}
        <button onClick={() => navigate('/auctions')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Auctions
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Image + Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image */}
            <div className={`relative rounded-2xl overflow-hidden h-72 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              {auction.imageUrl ? (
                <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-9xl">{auction.emoji}</span>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {auction.isFeatured && <span className="badge-featured"><Flame className="w-3 h-3" /> Featured</span>}
                <span className={`badge ${auction.status === 'active' ? 'badge-active' : auction.status === 'ended' ? 'badge-ended' : 'badge-cancelled'}`}>
                  {auction.status}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="glass-panel">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-sm text-white/50">{auction.category}</span>
                  <h1 className="text-2xl font-bold text-white mt-1">{auction.title}</h1>
                </div>
                {auction.status === 'ended' && auction.winner && (
                  <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs text-white/50">Winner</p>
                      <p className="text-amber-400 font-bold">{auction.winner}</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-white/60 mt-4 leading-relaxed">{auction.description || 'No description provided.'}</p>

              {auction.highlights?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Highlights</h3>
                  <ul className="space-y-1">
                    {auction.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/60 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-white/40">Starting Price</p>
                  <p className="text-white font-semibold">{formatCurrency(auction.startingPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Total Bids</p>
                  <p className="text-white font-semibold flex items-center gap-1"><Users className="w-4 h-4" /> {auction.bidCount}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Auction Ends</p>
                  <p className="text-white font-semibold text-sm">{formatDate(auction.endsAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Min Increment</p>
                  <p className="text-white font-semibold">{formatCurrency(auction.minBidIncrement || 100)}</p>
                </div>
              </div>
            </div>

            {/* Bid History */}
            <div className="glass-panel">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" /> Bid History
              </h2>
              <div ref={bidsRef} className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {auction.bids?.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-6">No bids yet — be the first!</p>
                ) : (
                  [...auction.bids].reverse().map((bid, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-all ${i === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-xs font-bold">
                          {bid.username[0].toUpperCase()}
                        </div>
                        <span className={`text-sm font-medium ${i === 0 ? 'text-amber-400' : 'text-white'}`}>{bid.username}</span>
                        {i === 0 && <Crown className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${i === 0 ? 'text-amber-400' : 'text-white'}`}>{formatCurrency(bid.amount)}</p>
                        <p className="text-xs text-white/40">{new Date(bid.placedAt).toLocaleTimeString('en-IN')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Bidding Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current price */}
            <div className={`glass-panel text-center transition-all ${bidFlash ? 'bid-flash' : ''}`}>
              <p className="text-white/50 text-sm">Current Bid</p>
              <p className="text-4xl font-black text-amber-400 my-2">{formatCurrency(auction.currentPrice)}</p>
              {auction.leadingBidder && (
                <div className="flex items-center justify-center gap-2 text-sm text-white/50">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Leading: <span className={isLeading ? 'text-emerald-400 font-semibold' : 'text-white'}>{auction.leadingBidder}</span></span>
                  {isLeading && <span className="badge-active text-xs">You!</span>}
                </div>
              )}
            </div>

            {/* Countdown */}
            <div className="glass-panel text-center">
              <div className="flex items-center justify-center gap-2 text-white/50 text-sm mb-3">
                <Clock className="w-4 h-4" /> Time Remaining
              </div>
              <CountdownTimer endsAt={auction.endsAt} />
            </div>

            {/* Winner badge */}
            {auction.status === 'ended' && isWinner && (
              <div className="glass-panel text-center border-amber-500/40 bg-amber-500/10">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-amber-400 font-bold text-lg">You Won!</p>
                <p className="text-white/50 text-sm">Congratulations on winning this auction</p>
              </div>
            )}

            {/* Bid input */}
            {auction.status === 'active' && (
              <div className="glass-panel space-y-4">
                <h3 className="font-semibold text-white">Place Your Bid</h3>

                {/* Quick bid buttons */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Quick increments</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000, 2000, 5000, 10000].map(inc => (
                      <button
                        key={inc}
                        onClick={() => quickBid(inc)}
                        className="bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/50 text-white/70 hover:text-white text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />{inc >= 1000 ? `${inc/1000}K` : inc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1 block">Your bid amount (₹)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    min={minBid}
                    className="input-field text-lg font-bold"
                    placeholder={`Min: ${formatCurrency(minBid)}`}
                  />
                  <p className="text-xs text-white/30 mt-1">Minimum bid: {formatCurrency(minBid)}</p>
                </div>

                {!user ? (
                  <button onClick={() => navigate('/login')} className="btn-primary w-full">Login to Bid</button>
                ) : (
                  <button
                    onClick={placeBid}
                    disabled={placing}
                    className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {placing ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Placing...</> : '🔨 Place Bid'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
