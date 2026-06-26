import { useState, useRef, useEffect } from 'react'
import { API_URL } from '../api'
import { useLanguage } from '../i18n/LanguageContext'

const SUGGESTED_PROMPTS = [
  'What crops should I grow this season?',
  'How to treat yellow leaves on tomatoes?',
  'Best organic fertilizer for rice?',
  'How to manage water in summer?',
  'Government schemes for small farmers',
  'When to harvest wheat?',
]

function AIAssistant({ user }) {
  const { language } = useLanguage()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(-10),
          userId: user?.id,
          language: language,
        }),
      })

      if (!res.ok) throw new Error('AI service unavailable')
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply || 'I could not process that. Please try again.' }])
    } catch (err) {
      // Fallback local response
      const fallback = getFallbackResponse(userMsg)
      setMessages([...newMessages, { role: 'assistant', content: fallback }])
    }
    setLoading(false)
  }

  const getFallbackResponse = (query) => {
    const q = query.toLowerCase()
    if (q.includes('crop') || q.includes('grow') || q.includes('season')) {
      return `Based on the current season (June-July), here are my recommendations:\n\n🌾 **Kharif Crops:** Rice, Maize, Cotton, Soybean, Groundnut\n🌱 **Vegetables:** Tomato, Okra, Bottle Gourd, Cucumber\n\n**Tips:**\n• Ensure proper drainage for monsoon\n• Use organic compost before sowing\n• Check soil moisture regularly\n\nFor location-specific advice, try the Weather Advisory in your dashboard.`
    }
    if (q.includes('disease') || q.includes('yellow') || q.includes('leaf') || q.includes('pest')) {
      return `Here are common solutions for crop diseases:\n\n🔍 **Yellow Leaves:** Often caused by nitrogen deficiency or overwatering\n• Apply urea (46-0-0) at 50kg/acre\n• Ensure proper drainage\n• Check for aphid infestation\n\n🦠 **Fungal Issues:**\n• Apply Neem oil spray (5ml/L)\n• Use Trichoderma as bio-fungicide\n• Maintain plant spacing for air flow\n\n📸 Use our **Disease Detection** feature to upload a photo for precise diagnosis!`
    }
    if (q.includes('fertilizer') || q.includes('nutrient')) {
      return `**Fertilizer Recommendations:**\n\n🌿 **Organic Options:**\n• Vermicompost: 2-3 tons/acre\n• Neem cake: 200kg/acre\n• Jeevamrut: 200L/acre (liquid)\n\n⚗️ **Chemical (if needed):**\n• DAP: 50kg/acre at sowing\n• Urea: 50kg/acre in 2 splits\n• Potash: 25kg/acre\n\n💡 **Tip:** Always do a soil test first! Upload your soil report in the Soil Health section for personalized advice.`
    }
    if (q.includes('water') || q.includes('irrigation')) {
      return `**Water Management Tips:**\n\n💧 **Drip Irrigation:** Saves 30-50% water, best for vegetables\n🌊 **Sprinkler:** Good for wheat, pulses on larger fields\n🏺 **Mulching:** Reduces evaporation by 25-30%\n\n**Schedule:**\n• Summer: Every 3-4 days\n• Monsoon: Only when needed\n• Winter: Every 7-10 days\n\n**Govt Subsidy:** PM Krishi Sinchai Yojana provides up to 55% subsidy on micro-irrigation systems.`
    }
    if (q.includes('scheme') || q.includes('government') || q.includes('subsidy')) {
      return `**Key Government Schemes for Farmers:**\n\n1. 🏦 **PM-KISAN:** ₹6000/year direct transfer\n2. 💰 **KCC (Kisan Credit Card):** Low-interest crop loans\n3. 🌾 **PM Fasal Bima Yojana:** Crop insurance at 1.5-2% premium\n4. 💧 **PM Krishi Sinchai Yojana:** Irrigation subsidies\n5. 🧪 **Soil Health Card:** Free soil testing\n6. 🌱 **Paramparagat Krishi Vikas:** Organic farming support\n\nVisit your nearest CSC center or check the Government Schemes section in the app.`
    }
    if (q.includes('price') || q.includes('market') || q.includes('sell')) {
      return `**Market Tips:**\n\n📈 **Current Trends:**\n• Vegetables prices are higher in off-season\n• Organic produce fetches 20-40% premium\n• Direct selling via apps gives better margins\n\n**Best Practices:**\n• Grade and sort before selling\n• Build direct buyer connections\n• Use cold storage for perishables\n• Check MSP (Minimum Support Price) rates\n\n**Use our Marketplace** to sell directly to consumers and get better prices!`
    }
    return `Hi! I'm Krishi 🌱 — your smart farming assistant! I can help with:\n\n🌾 Crop recommendations\n🐛 Disease identification\n💊 Fertilizer advice\n💧 Water management\n🏛️ Government schemes\n📈 Market guidance\n🌤️ Weather-based planning\n\nAsk me anything! For example:\n• "What should I grow in monsoon?"\n• "How to treat leaf curl in chilli?"\n• "Best organic fertilizer for wheat?"`
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-red-500 hover:bg-red-600 rotate-45'
            : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 animate-pulse-slow'
        }`}
        aria-label="Krishi AI Assistant"
      >
        {open ? (
          <span className="text-white text-2xl font-bold">+</span>
        ) : (
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="16" r="10" fill="white" fillOpacity="0.9"/>
            <circle cx="16" cy="14" r="2" fill="#16a34a"/>
            <circle cx="24" cy="14" r="2" fill="#16a34a"/>
            <path d="M15 19 Q20 23 25 19" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M12 8 Q10 4 14 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M28 8 Q30 4 26 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <rect x="14" y="26" width="12" height="6" rx="3" fill="white" fillOpacity="0.7"/>
            <path d="M17 29 h6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-96 h-[70vh] max-h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="16" r="10" fill="white" fillOpacity="0.9"/>
                <circle cx="16" cy="14" r="2" fill="#16a34a"/>
                <circle cx="24" cy="14" r="2" fill="#16a34a"/>
                <path d="M15 19 Q20 23 25 19" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M12 8 Q10 4 14 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M28 8 Q30 4 26 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">Krishi AI</h3>
              <p className="text-green-100 text-xs">Smart farming assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-xl">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="16" r="10" fill="#dcfce7"/>
                    <circle cx="16" cy="14" r="2" fill="#16a34a"/>
                    <circle cx="24" cy="14" r="2" fill="#16a34a"/>
                    <path d="M15 19 Q20 23 25 19" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <path d="M12 8 Q10 4 14 6" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    <path d="M28 8 Q30 4 26 6" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1">
                  Hi! I'm Krishi 👋
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                  Your AI farming assistant. Ask me anything!
                </p>
                <div className="space-y-2">
                  {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="block w-full text-left text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 hover:border-green-400 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      💬 {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'ml-auto bg-green-600 text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700 w-fit shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask Krishi anything..."
                className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium disabled:opacity-50 transition-colors"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
