import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, X, Save } from 'lucide-react'
import { CATEGORIES } from '../../utils/format'

const DEFAULT = {
  title: '', description: '', category: '', emoji: '🏺', imageUrl: '',
  startingPrice: '', minBidIncrement: '100',
  endsAt: '', isFeatured: false, highlights: []
}

export default function AdminCreateAuction() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState(DEFAULT)
  const [highlight, setHighlight] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/admin/auctions`).then(r => {
        const a = r.data.find(x => x._id === id)
        if (a) {
          const endsAt = new Date(a.endsAt).toISOString().slice(0, 16)
          setForm({ ...a, startingPrice: String(a.startingPrice), minBidIncrement: String(a.minBidIncrement || 100), endsAt })
        }
      }).catch(() => toast.error('Failed to load auction'))
    }
  }, [id, isEdit])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addHighlight = () => {
    if (!highlight.trim()) return
    setForm(p => ({ ...p, highlights: [...(p.highlights || []), highlight.trim()] }))
    setHighlight('')
  }

  const removeHighlight = (i) => {
    setForm(p => ({ ...p, highlights: p.highlights.filter((_, idx) => idx !== i) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.category || !form.startingPrice || !form.endsAt) {
      toast.error('Please fill all required fields'); return
    }
    if (new Date(form.endsAt) <= new Date()) {
      toast.error('End time must be in the future'); return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        startingPrice: Number(form.startingPrice),
        minBidIncrement: Number(form.minBidIncrement) || 100
      }
      if (isEdit) {
        await axios.put(`/api/admin/auctions/${id}`, payload)
        toast.success('Auction updated!')
      } else {
        await axios.post('/api/admin/auctions', payload)
        toast.success('Auction created!')
      }
      navigate('/admin/auctions')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const selectedCat = CATEGORIES.find(c => c.label === form.category)

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => navigate('/admin/auctions')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Auctions
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">{isEdit ? 'Edit Auction' : 'Create New Auction'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-panel space-y-4">
          <h2 className="font-semibold text-white border-b border-white/10 pb-3">Basic Information</h2>

          <div>
            <label className="text-sm text-white/60 block mb-1">Title <span className="text-red-400">*</span></label>
            <input type="text" required value={form.title} onChange={e => set('title', e.target.value)} className="input-field" placeholder="e.g. Vintage Rolex Submariner 1969" />
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="input-field resize-none"
              rows={4}
              placeholder="Detailed description of the item..."
            />
          </div>

          {/* Highlights */}
          <div>
            <label className="text-sm text-white/60 block mb-2">Highlights</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={highlight}
                onChange={e => setHighlight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                className="input-field flex-1"
                placeholder="Add a highlight (press Enter)"
              />
              <button type="button" onClick={addHighlight} className="btn-secondary flex items-center gap-1 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {form.highlights?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.highlights.map((h, i) => (
                  <span key={i} className="flex items-center gap-1 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full">
                    ✓ {h}
                    <button type="button" onClick={() => removeHighlight(i)} className="text-white/40 hover:text-red-400 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category & Display */}
        <div className="glass-panel space-y-4">
          <h2 className="font-semibold text-white border-b border-white/10 pb-3">Category & Display</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/60 block mb-1">Category <span className="text-red-400">*</span></label>
              <select required value={form.category} onChange={e => { set('category', e.target.value); const cat = CATEGORIES.find(c => c.label === e.target.value); if (cat) set('emoji', cat.emoji) }} className="input-field cursor-pointer">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 block mb-1">Emoji</label>
              <input type="text" value={form.emoji} onChange={e => set('emoji', e.target.value)} className="input-field" placeholder="🏺" maxLength={4} />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-1">Image URL <span className="text-white/30">(optional)</span></label>
            <input type="url" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} className="input-field" placeholder="https://..." />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />
            )}
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <label htmlFor="featured" className="text-sm text-white/70 cursor-pointer">Feature this auction on the homepage</label>
          </div>
        </div>

        {/* Pricing & Timing */}
        <div className="glass-panel space-y-4">
          <h2 className="font-semibold text-white border-b border-white/10 pb-3">Pricing & Timing</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/60 block mb-1">Starting Price (₹) <span className="text-red-400">*</span></label>
              <input type="number" required min={1} value={form.startingPrice} onChange={e => set('startingPrice', e.target.value)} className="input-field" placeholder="5000" />
            </div>
            <div>
              <label className="text-sm text-white/60 block mb-1">Min Bid Increment (₹)</label>
              <input type="number" min={1} value={form.minBidIncrement} onChange={e => set('minBidIncrement', e.target.value)} className="input-field" placeholder="100" />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-1">Auction End Date & Time <span className="text-red-400">*</span></label>
            <input
              type="datetime-local" required
              value={form.endsAt}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              onChange={e => set('endsAt', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {isEdit ? 'Update Auction' : 'Create Auction'}</>}
          </button>
          <button type="button" onClick={() => navigate('/admin/auctions')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
