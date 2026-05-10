export const formatCurrency = (n) =>
  '₹' + Number(n).toLocaleString('en-IN')

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

export const CATEGORIES = [
  { label: 'Electronics', emoji: '💻' },
  { label: 'Art', emoji: '🎨' },
  { label: 'Watches', emoji: '⌚' },
  { label: 'Jewellery', emoji: '💎' },
  { label: 'Vehicles', emoji: '🚗' },
  { label: 'Real Estate', emoji: '🏠' },
  { label: 'Antiques', emoji: '🏺' },
  { label: 'Fashion', emoji: '👗' },
  { label: 'Sports', emoji: '⚽' },
  { label: 'Collectibles', emoji: '🪙' }
]

export const CATEGORY_COLORS = {
  Electronics: 'from-blue-600 to-cyan-600',
  Art: 'from-pink-600 to-rose-600',
  Watches: 'from-amber-600 to-orange-600',
  Jewellery: 'from-yellow-500 to-amber-500',
  Vehicles: 'from-slate-600 to-zinc-600',
  'Real Estate': 'from-emerald-600 to-teal-600',
  Antiques: 'from-amber-700 to-yellow-600',
  Fashion: 'from-purple-600 to-fuchsia-600',
  Sports: 'from-green-600 to-emerald-600',
  Collectibles: 'from-indigo-600 to-violet-600'
}
