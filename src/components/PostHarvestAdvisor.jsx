import { useState } from 'react'
import { API_URL } from '../api'
import { useLanguage } from '../i18n/LanguageContext'

const POPULAR_CROPS = [
  { name: 'Wheat', emoji: '🌾' },
  { name: 'Rice', emoji: '🍚' },
  { name: 'Onion', emoji: '🧅' },
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Potato', emoji: '🥔' },
  { name: 'Cotton', emoji: '🏵️' },
  { name: 'Soybean', emoji: '🫘' },
  { name: 'Sugarcane', emoji: '🎋' },
]

const INDIAN_STATES = [
  'Maharashtra', 'Madhya Pradesh', 'Uttar Pradesh', 'Gujarat', 'Rajasthan',
  'Karnataka', 'Andhra Pradesh', 'Telangana', 'Punjab', 'Haryana',
  'Tamil Nadu', 'Bihar', 'West Bengal', 'Chhattisgarh', 'Odisha',
]

function PostHarvestAdvisor({ user }) {
  const { language, t } = useLanguage()
  const [form, setForm] = useState({ crop: '', quantity: '', district: '', state: '', mandiPrice: '' })
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })

  const getAdvice = async () => {
    if (!form.crop || !form.district || !form.state) {
      alert('Please fill crop name, district, and state!')
      return
    }
    setLoading(true)
    setAdvice('')
    setShowResult(false)
    try {
      const res = await fetch(`${API_URL}/api/post-harvest-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: form.crop,
          quantity: form.quantity || 'not specified',
          district: form.district,
          state: form.state,
          mandiPrice: form.mandiPrice || null,
          language,
        }),
      })
      const data = await res.json()
      setAdvice(data.advice || 'Could not get advice. Try again.')
      setShowResult(true)
    } catch {
      setAdvice('Server not reachable. Please start the backend with: npm run server')
      setShowResult(true)
    }
    setLoading(false)
  }

  const selectCrop = (cropName) => {
    setForm({ ...form, crop: cropName })
    setShowResult(false)
    setAdvice('')
  }

  const reset = () => {
    setForm({ crop: '', quantity: '', district: '', state: '', mandiPrice: '' })
    setAdvice('')
    setShowResult(false)
  }

  // Parse recommendation type from advice text
  const getRecommendationType = () => {
    const upper = advice.toUpperCase()
    if (upper.includes('SELL NOW') || upper.includes('अभी बेचें')) return 'sell'
    if (upper.includes('STORE') || upper.includes('स्टोर')) return 'store'
    if (upper.includes('PARTIAL')) return 'partial'
    return 'neutral'
  }

  const recommendationColors = {
    sell: 'from-red-500 to-orange-500',
    store: 'from-blue-500 to-indigo-500',
    partial: 'from-amber-500 to-yellow-500',
    neutral: 'from-green-500 to-emerald-500',
  }

  const recommendationIcons = {
    sell: '🚨',
    store: '📦',
    partial: '⚖️',
    neutral: '💡',
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">📊</div>
          <div>
            <h2 className="text-xl font-bold">Post-Harvest Advisor</h2>
            <p className="text-amber-100 text-sm">Should you sell now or store for better price?</p>
          </div>
        </div>
        <p className="text-amber-50 text-xs mt-3 opacity-80">
          📅 Current: {currentMonth} | 🌐 Response in your selected language
        </p>
      </div>

      {/* Quick Crop Selection */}
      {!showResult && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">⚡ Quick Select Crop:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CROPS.map((c) => (
              <button
                key={c.name}
                onClick={() => selectCrop(c.name)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                  form.crop === c.name
                    ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-800 dark:text-amber-300 scale-105'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      {!showResult && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">📝 Crop Details:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Crop Name */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Crop Name *</label>
              <input
                placeholder="e.g. Onion, Wheat, Tomato"
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Quantity (Quintals)</label>
              <input
                placeholder="e.g. 50"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            {/* District */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">District *</label>
              <input
                placeholder="e.g. Nashik, Indore, Guntur"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            {/* State */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">State *</label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Mandi Price */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Current Mandi Price ₹/Quintal (Optional)</label>
              <input
                placeholder="e.g. 2500 (leave blank if unknown)"
                type="number"
                value={form.mandiPrice}
                onChange={(e) => setForm({ ...form, mandiPrice: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={getAdvice}
            disabled={loading || !form.crop || !form.district || !form.state}
            className="w-full mt-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> Analyzing Market Data...</>
            ) : (
              <>📊 Get Sell / Store Recommendation</>
            )}
          </button>
        </div>
      )}

      {/* Result Card */}
      {showResult && advice && (
        <div className="space-y-4">
          {/* Recommendation Badge */}
          <div className={`bg-gradient-to-r ${recommendationColors[getRecommendationType()]} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{recommendationIcons[getRecommendationType()]}</span>
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80">Recommendation for</p>
                <p className="text-lg font-bold">{form.crop} — {form.district}, {form.state}</p>
              </div>
            </div>
            {form.quantity && <p className="text-sm opacity-80 mt-1">📦 Quantity: {form.quantity} quintals</p>}
          </div>

          {/* Advice Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{advice}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              🔄 Check Another Crop
            </button>
            <button
              onClick={getAdvice}
              disabled={loading}
              className="flex-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 py-3 rounded-xl font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50"
            >
              🔁 Refresh Advice
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostHarvestAdvisor
