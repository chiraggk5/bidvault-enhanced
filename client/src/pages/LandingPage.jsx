import { Link } from 'react-router-dom'
import { Gavel, Zap, Shield, Trophy, ArrowRight, Star } from 'lucide-react'
import Navbar from '../components/shared/Navbar'
import { useEffect, useState } from 'react'
import axios from 'axios'
import AuctionCard from '../components/user/AuctionCard'

const FEATURES = [
  { icon: Zap, title: 'Real-Time Bidding', desc: 'Live bid updates powered by WebSockets — see every bid the instant it happens.', color: 'text-amber-400' },
  { icon: Shield, title: 'Secure Platform', desc: 'JWT-authenticated accounts and encrypted transactions keep your data safe.', color: 'text-emerald-400' },
  { icon: Trophy, title: 'Win & Celebrate', desc: 'Compete with other bidders and track your victories on your personal dashboard.', color: 'text-purple-400' }
]

const STATS = [
  { label: 'Active Auctions', value: '100+' },
  { label: 'Happy Bidders', value: '5K+' },
  { label: 'Items Sold', value: '2K+' },
  { label: 'Total Value', value: '₹10Cr+' }
]

export default function LandingPage() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    axios.get('/api/auctions?isFeatured=true')
      .then(r => setFeatured(r.data.filter(a => a.isFeatured).slice(0, 3)))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient relative min-h-screen flex items-center justify-center text-center px-4 pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i}
              className="absolute rounded-full opacity-10 animate-pulse-slow"
              style={{
                width: Math.random() * 6 + 2 + 'px',
                height: Math.random() * 6 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                background: i % 2 === 0 ? '#a855f7' : '#f59e0b',
                animationDelay: Math.random() * 3 + 's'
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white/70 mb-8">
            <Star className="w-4 h-4 text-amber-400" />
            India's Premier Real-Time Auction Platform
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight">
            Bid Smart.<br />
            <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">Win Big.</span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover exclusive items, place live bids, and win incredible deals — all in real-time. From electronics to rare antiques, BidVault has it all.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auctions" className="btn-gold flex items-center gap-2 text-lg px-8 py-4">
              <Gavel className="w-5 h-5" /> Explore Auctions
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="btn-secondary text-lg px-8 py-4">
              Create Account — It's Free
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30"></div>
          <span className="text-xs">Scroll to explore</span>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why BidVault?</h2>
            <p className="text-white/50 max-w-xl mx-auto">Built for serious bidders and sellers who demand speed, security, and simplicity.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-panel hover:border-white/20 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      {featured.length > 0 && (
        <section className="py-16 px-4 bg-white/3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">🔥 Featured Auctions</h2>
                <p className="text-white/50 mt-1">Hand-picked by our team — don't miss out</p>
              </div>
              <Link to="/auctions" className="btn-secondary text-sm hidden sm:flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(a => <AuctionCard key={a._id} auction={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-panel border-purple-500/30">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to start winning?</h2>
            <p className="text-white/50 mb-8">Join thousands of bidders already on BidVault. Registration is free and takes 30 seconds.</p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-white/30 text-sm">
        <p>© 2025 BidVault — Real-Time Auction Platform. Built for CSD303A Modern Application Development.</p>
      </footer>
    </div>
  )
}
