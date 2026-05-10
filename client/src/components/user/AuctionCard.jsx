import { Link } from 'react-router-dom'
import { Flame, Users, Clock } from 'lucide-react'
import { formatCurrency, CATEGORY_COLORS } from '../../utils/format'
import CountdownTimer from '../shared/CountdownTimer'

export default function AuctionCard({ auction }) {
  const gradient = CATEGORY_COLORS[auction.category] || 'from-purple-600 to-violet-600'
  const isEnding = new Date(auction.endsAt) - Date.now() < 3600000

  return (
    <Link to={`/auctions/${auction._id}`} className="card group hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 overflow-hidden block">
      {/* Image / Emoji Banner */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {auction.imageUrl ? (
          <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-300">{auction.emoji}</span>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {auction.isFeatured && (
            <span className="badge-featured text-xs"><Flame className="w-3 h-3" /> Featured</span>
          )}
          {isEnding && auction.status === 'active' && (
            <span className="badge bg-red-500/80 text-white border-0 text-xs animate-pulse"><Clock className="w-3 h-3" /> Ending Soon</span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="badge bg-black/40 text-white/80 border-0 text-xs">{auction.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">{auction.title}</h3>
        <p className="text-white/50 text-sm mt-1 line-clamp-2">{auction.description || 'No description provided.'}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40">Current Bid</p>
            <p className="text-lg font-bold text-amber-400">{formatCurrency(auction.currentPrice)}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-white/40 text-xs justify-end">
              <Users className="w-3 h-3" /> {auction.bidCount} bids
            </div>
            <CountdownTimer endsAt={auction.endsAt} compact />
          </div>
        </div>

        {auction.leadingBidder && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-xs font-bold">
              {auction.leadingBidder[0].toUpperCase()}
            </div>
            <span className="text-xs text-white/50">Leading: <span className="text-white">{auction.leadingBidder}</span></span>
          </div>
        )}
      </div>
    </Link>
  )
}
