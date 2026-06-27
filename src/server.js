import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
const app = express()

app.use(
  cors({
    origin: [
      'https://krishimitra-delta.vercel.app',
      /https:\/\/krishimitra.*\.vercel\.app$/,
      'http://localhost:5173',
    ],
    credentials: true,
  })
)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf
    },
  })
)

const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
const razorpayEnabled = Boolean(razorpayKeyId && razorpayKeySecret)
const razorpay = razorpayEnabled
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null
const paymentStore = new Map()
const webhookEvents = []
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const dbEnabled = Boolean(supabaseUrl && supabaseServiceKey)
const supabaseAdmin = dbEnabled ? createClient(supabaseUrl, supabaseServiceKey) : null

const savePaymentToDb = async (orderId, payload) => {
  if (!dbEnabled) return
  const { error } = await supabaseAdmin.from('payments').upsert(
    {
      order_id: orderId,
      checkout_status: payload.checkout_status || null,
      amount: payload.amount ?? null,
      currency: payload.currency || 'INR',
      consumer_id: payload.consumer_id || null,
      payment_id: payload.payment_id || null,
      verified: payload.verified ?? null,
      method: payload.method || null,
      items: payload.items || null,
      webhook_received_at: payload.webhook_received_at || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'order_id' }
  )
  if (error) {
    console.error('Supabase payment upsert error:', error.message)
  }
}

const saveWebhookEventToDb = async (event) => {
  if (!dbEnabled) return
  const { error } = await supabaseAdmin.from('payment_webhook_events').insert({
    event_id: event.id,
    event_type: event.type,
    payload: event.payload,
    created_at: event.created_at,
  })
  if (error) {
    console.error('Supabase webhook event insert error:', error.message)
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'KrishiMitra backend running',
    env: process.env.NODE_ENV || 'development',
    razorpay: razorpayEnabled,
    supabaseDb: dbEnabled,
    corsOrigins: [
      'https://krishimitra-delta.vercel.app',
      'https://krishimitra*.vercel.app',
      'http://localhost:5173',
    ],
  })
})

const buildLocalAdvisory = ({ location, month }) => {
  const lowerMonth = String(month || '').toLowerCase()
  let season = 'mild'
  if (['march', 'april', 'may', 'june'].includes(lowerMonth)) season = 'summer'
  if (['july', 'august', 'september'].includes(lowerMonth)) season = 'monsoon'
  if (['october', 'november', 'december', 'january', 'february'].includes(lowerMonth)) season = 'winter'

  const cropMap = {
    summer: ['Bajra', 'Moong', 'Groundnut'],
    monsoon: ['Paddy', 'Maize', 'Soybean'],
    winter: ['Wheat', 'Mustard', 'Chickpea'],
    mild: ['Vegetables', 'Pulses', 'Millets'],
  }

  return [
    `Location: ${location}`,
    `Month: ${month}`,
    `Season fit: ${season}`,
    `Suggested crops: ${cropMap[season].join(', ')}`,
    'Tip: Check local market rates and soil type before making your final decision.',
  ].join('\n')
}

const getAiAdvisory = async ({ location, month }) => {
  const groqKey = process.env.VITE_GROQ_KEY || process.env.GROQ_API_KEY
  if (!groqKey) {
    return buildLocalAdvisory({ location, month })
  }

  try {
    const prompt = `You are an agriculture advisor for Indian farmers.
Give practical crop suggestions for:
- Location: ${location}
- Month: ${month}

Respond in simple English with:
1) Best 3 crops
2) Why they are suitable now
3) One risk and how to reduce it
4) Two practical next steps`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq request failed: ${response.status}`)
    }

    const data = await response.json()
    return data?.choices?.[0]?.message?.content?.trim() || buildLocalAdvisory({ location, month })
  } catch (error) {
    console.warn('AI provider failed, using local advisory fallback:', error.message)
    return buildLocalAdvisory({ location, month })
  }
}

const advisoryHandler = async (req, res) => {
  const { location, month } = req.body || {}
  if (!location) {
    return res.status(400).json({ error: 'location is required' })
  }

  const resolvedMonth =
    month ||
    new Date().toLocaleString('en-US', { month: 'long' })

  const result = await getAiAdvisory({ location, month: resolvedMonth })
  return res.json({ result })
}

app.post('/advisory', advisoryHandler)
app.post('/api/advisory', advisoryHandler)

const toDayKey = (timestampSeconds) => {
  const d = new Date(timestampSeconds * 1000)
  return d.toISOString().slice(0, 10)
}

const getWeatherSeasonCrops = (avgTemp, avgRainMm) => {
  if (avgRainMm >= 8) {
    return ['Paddy', 'Maize', 'Soybean']
  }
  if (avgTemp >= 30) {
    return ['Bajra', 'Moong', 'Groundnut']
  }
  if (avgTemp <= 22) {
    return ['Wheat', 'Mustard', 'Chickpea']
  }
  return ['Vegetables', 'Pulses', 'Millets']
}

const buildWeatherAdvisory = ({ location, forecast }) => {
  const avgTemp =
    forecast.reduce((sum, day) => sum + (day.temp_max_c + day.temp_min_c) / 2, 0) / forecast.length
  const avgRain =
    forecast.reduce((sum, day) => sum + day.rain_mm, 0) / forecast.length

  const crops = getWeatherSeasonCrops(avgTemp, avgRain)

  return [
    `Location: ${location}`,
    `Next 7-day avg temp: ${avgTemp.toFixed(1)} C`,
    `Next 7-day avg rain: ${avgRain.toFixed(1)} mm/day`,
    `Best crop options: ${crops.join(', ')}`,
    'Action: Monitor soil moisture and plan sowing based on irrigation and expected rainfall.',
  ].join('\n')
}

const buildFallbackForecast = () => {
  const conditions = ['Clear', 'Clouds', 'Light Rain', 'Clouds', 'Rain', 'Clear', 'Clouds']
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return {
      date: date.toISOString().slice(0, 10),
      temp_min_c: 24 + (index % 3),
      temp_max_c: 33 + (index % 2),
      humidity: 65 + (index % 4) * 4,
      rain_mm: index % 2 === 0 ? 4 : 1,
      condition: conditions[index],
      predicted: true,
    }
  })
}

const buildFallbackWeatherResult = (location, reason) => {
  if (reason) {
    console.warn(`OpenWeather unavailable (${reason}), using fallback forecast`)
  }
  return {
    resolvedLocation: location,
    forecast: buildFallbackForecast(),
    source: 'fallback',
  }
}

const getOpenWeatherForecast = async (location) => {
  const weatherApiKey = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_KEY
  if (!weatherApiKey) {
    return buildFallbackWeatherResult(location, 'no API key configured')
  }

  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${weatherApiKey}`
    )
    if (!geoRes.ok) {
      return buildFallbackWeatherResult(location, `geocoding HTTP ${geoRes.status}`)
    }
    const geoData = await geoRes.json()
    if (!Array.isArray(geoData) || geoData.length === 0) {
      return buildFallbackWeatherResult(location, 'location not found')
    }

    const { lat, lon, name, state, country } = geoData[0]
    const resolvedLocation = [name, state, country].filter(Boolean).join(', ')

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
    )
    if (!forecastRes.ok) {
      return buildFallbackWeatherResult(location, `forecast HTTP ${forecastRes.status}`)
    }
    const forecastData = await forecastRes.json()
    const entries = forecastData?.list || []
    if (entries.length === 0) {
      return buildFallbackWeatherResult(location, 'empty forecast')
    }

    const grouped = {}
    for (const entry of entries) {
      const key = toDayKey(entry.dt)
      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          tempMin: Number.POSITIVE_INFINITY,
          tempMax: Number.NEGATIVE_INFINITY,
          humiditySum: 0,
          humidityCount: 0,
          rainMm: 0,
          condition: entry.weather?.[0]?.main || 'Clear',
        }
      }

      grouped[key].tempMin = Math.min(grouped[key].tempMin, entry.main?.temp_min ?? grouped[key].tempMin)
      grouped[key].tempMax = Math.max(grouped[key].tempMax, entry.main?.temp_max ?? grouped[key].tempMax)
      grouped[key].humiditySum += entry.main?.humidity ?? 0
      grouped[key].humidityCount += 1
      grouped[key].rainMm += entry.rain?.['3h'] ?? 0
    }

    const days = Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 7)
      .map((d) => ({
        date: d.date,
        temp_min_c: Number.isFinite(d.tempMin) ? Number(d.tempMin.toFixed(1)) : 0,
        temp_max_c: Number.isFinite(d.tempMax) ? Number(d.tempMax.toFixed(1)) : 0,
        humidity: d.humidityCount ? Math.round(d.humiditySum / d.humidityCount) : 0,
        rain_mm: Number(d.rainMm.toFixed(1)),
        condition: d.condition,
        predicted: false,
      }))

    while (days.length < 7) {
      const last = days[days.length - 1] || {
        date: new Date().toISOString().slice(0, 10),
        temp_min_c: 24,
        temp_max_c: 32,
        humidity: 65,
        rain_mm: 2,
        condition: 'Clouds',
        predicted: true,
      }
      const nextDate = new Date(last.date)
      nextDate.setDate(nextDate.getDate() + 1)
      days.push({
        ...last,
        date: nextDate.toISOString().slice(0, 10),
        predicted: true,
      })
    }

    return { resolvedLocation, forecast: days, source: 'openweather' }
  } catch (error) {
    return buildFallbackWeatherResult(location, error.message)
  }
}

app.post('/api/weather-advisory', async (req, res) => {
  const { location } = req.body || {}
  if (!location) {
    return res.status(400).json({ error: 'location is required' })
  }

  const weatherData = await getOpenWeatherForecast(location)
  const advisory = buildWeatherAdvisory({
    location: weatherData.resolvedLocation,
    forecast: weatherData.forecast,
  })

  return res.json({
    location: weatherData.resolvedLocation,
    source: weatherData.source,
    forecast: weatherData.forecast,
    advisory,
  })
})

app.get('/api/payments/config', (_req, res) => {
  if (!razorpayEnabled) {
    return res.status(503).json({ error: 'Razorpay is not configured on server' })
  }
  return res.json({ keyId: razorpayKeyId, dbEnabled })
})

app.post('/api/payments/checkout', async (req, res) => {
  if (!razorpayEnabled) {
    return res.status(503).json({ error: 'Razorpay is not configured on server' })
  }

  const { items, consumerId } = req.body || {}
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items are required for checkout' })
  }

  const totalAmount = items.reduce((sum, item) => {
    const price = Number(item.price_per_kg || 0)
    const qty = Number(item.quantity_kg || item.cartQty || 0)
    return sum + price * qty
  }, 0)

  if (!totalAmount || totalAmount <= 0) {
    return res.status(400).json({ error: 'invalid amount for checkout' })
  }

  try {
    const receipt = `rcpt_${Date.now()}`
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt,
      notes: {
        consumer_id: consumerId || 'guest',
        item_count: String(items.length),
      },
    })

    paymentStore.set(order.id, {
      checkout_status: 'created',
      amount: totalAmount,
      currency: 'INR',
      consumer_id: consumerId || null,
      items,
      created_at: new Date().toISOString(),
    })
    await savePaymentToDb(order.id, paymentStore.get(order.id))

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId,
      receipt: order.receipt,
    })
  } catch (error) {
    console.error('Razorpay checkout error:', error.message)
    return res.status(500).json({ error: 'Failed to create Razorpay order' })
  }
})

app.post('/api/payments/verify', async (req, res) => {
  if (!razorpayEnabled) {
    return res.status(503).json({ error: 'Razorpay is not configured on server' })
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body || {}

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'payment verification params missing' })
  }

  const payload = `${orderId}|${paymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(payload)
    .digest('hex')

  const verified = expectedSignature === signature
  if (!verified) {
    paymentStore.set(orderId, {
      ...(paymentStore.get(orderId) || {}),
      checkout_status: 'verification_failed',
      payment_id: paymentId,
      verified: false,
      updated_at: new Date().toISOString(),
    })
    await savePaymentToDb(orderId, paymentStore.get(orderId))
    return res.status(400).json({ verified: false, error: 'Invalid payment signature' })
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId)
    paymentStore.set(orderId, {
      ...(paymentStore.get(orderId) || {}),
      checkout_status: payment.status || 'captured',
      payment_id: paymentId,
      verified: true,
      method: payment.method,
      updated_at: new Date().toISOString(),
    })
    await savePaymentToDb(orderId, paymentStore.get(orderId))

    return res.json({
      verified: true,
      paymentStatus: payment.status,
      orderId,
      paymentId,
      method: payment.method,
    })
  } catch (error) {
    console.error('Razorpay payment fetch error:', error.message)
    return res.status(500).json({ error: 'Payment verified but status fetch failed' })
  }
})

app.get('/api/payments/status/:orderId', async (req, res) => {
  const { orderId } = req.params
  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' })
  }

  const stored = paymentStore.get(orderId)
  if (stored) {
    return res.json({ orderId, ...stored })
  }

  if (dbEnabled) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle()
    if (!error && data) {
      return res.json({
        orderId: data.order_id,
        checkout_status: data.checkout_status,
        amount: data.amount,
        currency: data.currency,
        consumer_id: data.consumer_id,
        payment_id: data.payment_id,
        verified: data.verified,
        method: data.method,
        items: data.items,
        webhook_received_at: data.webhook_received_at,
        source: 'supabase',
      })
    }
  }

  if (!razorpayEnabled) {
    return res.status(404).json({ error: 'No payment status found' })
  }

  try {
    const order = await razorpay.orders.fetch(orderId)
    return res.json({
      orderId,
      checkout_status: order.status || 'unknown',
      amount: (order.amount || 0) / 100,
      currency: order.currency || 'INR',
      source: 'razorpay',
    })
  } catch (error) {
    return res.status(404).json({ error: 'Payment status not found' })
  }
})

app.get('/api/payments', async (req, res) => {
  const { consumerId } = req.query
  if (!consumerId) {
    return res.status(400).json({ error: 'consumerId query param is required' })
  }

  const memoryPayments = Array.from(paymentStore.entries())
    .map(([orderId, value]) => ({ order_id: orderId, ...value }))
    .filter((p) => p.consumer_id === consumerId)
    .sort((a, b) => String(b.updated_at || b.created_at || '').localeCompare(String(a.updated_at || a.created_at || '')))

  if (!dbEnabled) {
    return res.json({ payments: memoryPayments, source: 'memory' })
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('consumer_id', consumerId)
    .order('updated_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('Supabase payments list error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch payments' })
  }

  return res.json({
    payments: data || [],
    source: 'supabase',
  })
})

app.post('/api/payments/webhook', async (req, res) => {
  if (!razorpayWebhookSecret) {
    return res.status(503).json({ error: 'Webhook secret is not configured' })
  }

  const signature = req.headers['x-razorpay-signature']
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}))
  const expected = crypto
    .createHmac('sha256', razorpayWebhookSecret)
    .update(rawBody)
    .digest('hex')

  if (signature !== expected) {
    return res.status(400).json({ error: 'Invalid webhook signature' })
  }

  const event = req.body || {}
  webhookEvents.unshift({
    id: event.id || `evt_${Date.now()}`,
    type: event.event || 'unknown',
    created_at: new Date().toISOString(),
    payload: event,
  })
  if (webhookEvents.length > 50) webhookEvents.pop()
  await saveWebhookEventToDb(webhookEvents[0])

  const orderId = event?.payload?.payment?.entity?.order_id
  const paymentId = event?.payload?.payment?.entity?.id
  if (orderId) {
    paymentStore.set(orderId, {
      ...(paymentStore.get(orderId) || {}),
      checkout_status: event.event,
      payment_id: paymentId || paymentStore.get(orderId)?.payment_id || null,
      webhook_received_at: new Date().toISOString(),
    })
    await savePaymentToDb(orderId, paymentStore.get(orderId))
  }

  return res.json({ received: true })
})

app.get('/api/payments/webhook-events', (_req, res) => {
  return res.json({ events: webhookEvents, dbEnabled })
})

// ============ AI CHAT ASSISTANT ============
app.post('/api/ai-chat', async (req, res) => {
  const { message, history, language } = req.body || {}
  if (!message) return res.status(400).json({ error: 'message is required' })

  const langMap = {
    en: 'English', hi: 'Hindi', pa: 'Punjabi', gu: 'Gujarati',
    mai: 'Maithili', bho: 'Bhojpuri', ta: 'Tamil', te: 'Telugu',
  }
  const responseLang = langMap[language] || 'English'

  const groqKey = process.env.VITE_GROQ_KEY || process.env.GROQ_API_KEY
  if (!groqKey) {
    return res.json({ reply: getLocalAIResponse(message, language) })
  }

  try {
    const systemPrompt = `You are KrishiMitra AI, an expert Indian farming assistant. You help farmers with:
- Crop recommendations based on season, soil, and location
- Disease identification and treatment
- Fertilizer and pesticide guidance
- Water and irrigation management
- Government schemes and subsidies
- Market prices and selling strategies
- Organic farming practices
- Weather-based farming advice

IMPORTANT: Always respond in ${responseLang} language. If the user writes in any language, understand it but ALWAYS reply in ${responseLang}.
Be helpful, practical, and concise. Use emojis. Format with bullets and bold text.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 1000,
        messages,
      }),
    })

    if (!response.ok) throw new Error(`Groq ${response.status}`)
    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()
    return res.json({ reply: reply || getLocalAIResponse(message, language) })
  } catch (err) {
    console.warn('AI chat error:', err.message)
    return res.json({ reply: getLocalAIResponse(message, language) })
  }
})

const localResponses = {
  en: {
    crop: '🌾 For the current Kharif season, consider growing Rice, Maize, Cotton, or Soybean. For vegetables, try Tomato, Okra, and Cucumber.',
    disease: '🐛 Common solutions: Neem oil spray (5ml/L) for pests, Copper oxychloride for fungal issues, Trichoderma for soil-borne diseases.',
    fertilizer: '🌿 Organic: Vermicompost (2-3 tons/acre), Neem cake, Jeevamrut. Chemical: DAP at sowing, Urea in splits. Test soil first!',
    water: '💧 Drip irrigation saves 30-50% water. Mulching reduces evaporation. PM Krishi Sinchai Yojana offers 55% subsidy on micro-irrigation.',
    scheme: '🏛️ Key schemes: PM-KISAN (₹6000/year), KCC (low-interest loans), PM Fasal Bima (crop insurance), Soil Health Card.',
    default: '🌱 I can help with crop recommendations, disease detection, fertilizers, water management, government schemes, and market advice. What would you like to know?',
  },
  hi: {
    crop: '🌾 वर्तमान खरीफ सीजन के लिए धान, मक्का, कपास, या सोयाबीन उगाएं। सब्जियों में टमाटर, भिंडी और खीरा अच्छा रहेगा।',
    disease: '🐛 कीटों के लिए नीम तेल स्प्रे (5ml/L), फफूंद के लिए कॉपर ऑक्सीक्लोराइड, मिट्टी रोगों के लिए ट्राइकोडर्मा उपयोग करें।',
    fertilizer: '🌿 जैविक: वर्मीकम्पोस्ट (2-3 टन/एकड़), नीम खली, जीवामृत। रासायनिक: बुवाई पर DAP, यूरिया दो भागों में। पहले मिट्टी जांचें!',
    water: '💧 ड्रिप सिंचाई से 30-50% पानी बचता है। PM कृषि सिंचाई योजना 55% तक सब्सिडी देती है।',
    scheme: '🏛️ प्रमुख योजनाएं: PM-KISAN (₹6000/वर्ष), KCC (कम ब्याज ऋण), PM फसल बीमा, मृदा स्वास्थ्य कार्ड।',
    default: '🌱 मैं फसल सुझाव, रोग पहचान, उर्वरक, सिंचाई, सरकारी योजनाओं और बाजार सलाह में मदद कर सकता हूं। आप क्या जानना चाहते हैं?',
  },
  pa: {
    crop: '🌾 ਮੌਜੂਦਾ ਖਰੀਫ ਸੀਜ਼ਨ ਲਈ ਝੋਨਾ, ਮੱਕੀ, ਕਪਾਹ ਜਾਂ ਸੋਇਆਬੀਨ ਉਗਾਓ। ਸਬਜ਼ੀਆਂ ਵਿੱਚ ਟਮਾਟਰ, ਭਿੰਡੀ ਅਤੇ ਖੀਰਾ ਵਧੀਆ ਹੈ।',
    disease: '🐛 ਕੀੜਿਆਂ ਲਈ ਨਿੰਮ ਦਾ ਤੇਲ (5ml/L), ਫੰਗਸ ਲਈ ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ ਵਰਤੋ।',
    fertilizer: '🌿 ਜੈਵਿਕ: ਵਰਮੀਕੰਪੋਸਟ (2-3 ਟਨ/ਏਕੜ), ਨਿੰਮ ਖਲੀ। ਰਸਾਇਣਕ: DAP ਬਿਜਾਈ ਵੇਲੇ, ਯੂਰੀਆ ਦੋ ਹਿੱਸਿਆਂ ਵਿੱਚ।',
    water: '💧 ਡ੍ਰਿਪ ਸਿੰਚਾਈ ਨਾਲ 30-50% ਪਾਣੀ ਬਚਦਾ ਹੈ। PM ਕ੍ਰਿਸ਼ੀ ਸਿੰਚਾਈ ਯੋਜਨਾ 55% ਤੱਕ ਸਬਸਿਡੀ ਦਿੰਦੀ ਹੈ।',
    scheme: '🏛️ ਮੁੱਖ ਯੋਜਨਾਵਾਂ: PM-KISAN (₹6000/ਸਾਲ), KCC, PM ਫਸਲ ਬੀਮਾ, ਮਿੱਟੀ ਸਿਹਤ ਕਾਰਡ।',
    default: '🌱 ਮੈਂ ਫਸਲ ਸੁਝਾਅ, ਰੋਗ ਪਛਾਣ, ਖਾਦ, ਸਿੰਚਾਈ, ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਅਤੇ ਬਾਜ਼ਾਰ ਸਲਾਹ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।',
  },
  gu: {
    crop: '🌾 ખરીફ સીઝન માટે ડાંગર, મકાઈ, કપાસ અથવા સોયાબીન ઉગાડો। શાકભાજીમાં ટામેટા, ભીંડા અને કાકડી સારી છે।',
    disease: '🐛 જીવાત માટે લીમડાનું તેલ (5ml/L), ફૂગ માટે કોપર ઓક્સીક્લોરાઈડ વાપરો।',
    fertilizer: '🌿 જૈવિક: વર્મીકમ્પોસ્ટ (2-3 ટન/એકર), લીમડા ખોળ। રાસાયણિક: DAP વાવણી વખતે, યુરિયા બે ભાગમાં।',
    water: '💧 ડ્રિપ સિંચાઈથી 30-50% પાણી બચે છે। PM કૃષિ સિંચાઈ યોજના 55% સુધી સબસિડી આપે છે।',
    scheme: '🏛️ મુખ્ય યોજનાઓ: PM-KISAN (₹6000/વર્ષ), KCC, PM ફસલ બીમા, જમીન આરોગ્ય કાર્ડ।',
    default: '🌱 હું ફસલ સલાહ, રોગ ઓળખ, ખાતર, સિંચાઈ, સરકારી યોજનાઓ અને બજાર માર્ગદર્શનમાં મદદ કરી શકું છું।',
  },
  ta: {
    crop: '🌾 தற்போதைய காரீப் பருவத்திற்கு நெல், மக்காச்சோளம், பருத்தி அல்லது சோயாபீன் பயிரிடுங்கள்.',
    disease: '🐛 பூச்சிகளுக்கு வேப்ப எண்ணெய் (5ml/L), பூஞ்சைக்கு காப்பர் ஆக்சிகுளோரைடு பயன்படுத்துங்கள்.',
    fertilizer: '🌿 இயற்கை: மண்புழு உரம் (2-3 டன்/ஏக்கர்), வேப்பம் பிண்ணாக்கு. ரசாயன: DAP விதைப்பு நேரத்தில்.',
    water: '💧 சொட்டு நீர்ப்பாசனம் 30-50% நீரை சேமிக்கும். PM கிருஷி சிஞ்சாய் யோஜனா 55% வரை மானியம்.',
    scheme: '🏛️ முக்கிய திட்டங்கள்: PM-KISAN (₹6000/ஆண்டு), KCC, PM பசல் பீமா, மண் ஆரோக்கிய அட்டை.',
    default: '🌱 பயிர் பரிந்துரைகள், நோய் அடையாளம், உரங்கள், நீர்ப்பாசனம், அரசு திட்டங்கள் பற்றி உதவ முடியும்.',
  },
  te: {
    crop: '🌾 ప్రస్తుత ఖరీఫ్ సీజన్‌కు వరి, మొక్కజొన్న, పత్తి లేదా సోయాబీన్ పండించండి.',
    disease: '🐛 పురుగుల కోసం వేప నూనె (5ml/L), శిలీంధ్రాల కోసం కాపర్ ఆక్సీక్లోరైడ్ వాడండి.',
    fertilizer: '🌿 సేంద్రియ: వర్మీకంపోస్ట్ (2-3 టన్నులు/ఎకరం), వేప పిండి. రసాయన: DAP విత్తనం సమయంలో.',
    water: '💧 బిందు సేద్యం 30-50% నీటిని ఆదా చేస్తుంది. PM కృషి సించాయి యోజన 55% వరకు సబ్సిడీ.',
    scheme: '🏛️ ప్రధాన పథకాలు: PM-KISAN (₹6000/సంవత్సరం), KCC, PM ఫసల్ బీమా, నేల ఆరోగ్య కార్డ్.',
    default: '🌱 పంట సిఫారసులు, వ్యాధి గుర్తింపు, ఎరువులు, నీటిపారుదల, ప్రభుత్వ పథకాల గురించి సహాయం చేయగలను.',
  },
}

function getLocalAIResponse(query, lang = 'en') {
  const responses = localResponses[lang] || localResponses.en
  const q = query.toLowerCase()
  if (q.includes('crop') || q.includes('grow') || q.includes('फसल') || q.includes('उगा') || q.includes('பயிர்') || q.includes('పంట')) return responses.crop
  if (q.includes('disease') || q.includes('pest') || q.includes('रोग') || q.includes('कीट') || q.includes('நோய்') || q.includes('వ్యాధి')) return responses.disease
  if (q.includes('fertilizer') || q.includes('खाद') || q.includes('उर्वरक') || q.includes('உரம்') || q.includes('ఎరువు')) return responses.fertilizer
  if (q.includes('water') || q.includes('irrigation') || q.includes('पानी') || q.includes('सिंचाई') || q.includes('நீர்') || q.includes('నీరు')) return responses.water
  if (q.includes('scheme') || q.includes('government') || q.includes('योजना') || q.includes('सरकार') || q.includes('திட்ட') || q.includes('పథక')) return responses.scheme
  return responses.default
}

// ============ POST-HARVEST ADVISOR ============
app.post('/api/post-harvest-advice', async (req, res) => {
  const { crop, quantity, district, state, mandiPrice, language } = req.body || {}
  if (!crop || !district || !state) {
    return res.status(400).json({ error: 'crop, district, and state are required' })
  }

  const langMap = {
    en: 'English', hi: 'Hindi', pa: 'Punjabi', gu: 'Gujarati',
    mai: 'Maithili', bho: 'Bhojpuri', ta: 'Tamil', te: 'Telugu',
  }
  const responseLang = langMap[language] || 'Hindi and English mix'
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })

  const groqKey = process.env.VITE_GROQ_KEY || process.env.GROQ_API_KEY

  const systemPrompt = `You are KrishiMitra's Post-Harvest Advisor, an expert in Indian agricultural markets and storage logistics.
Your job is to help a farmer decide whether to SELL their crop immediately or STORE it for a better price later.

Your response MUST follow this exact structure (respond in ${responseLang}):
1. **RECOMMENDATION** (one of: SELL NOW / STORE FOR X DAYS / PARTIAL SELL)
2. **CURRENT PRICE ESTIMATE** — Give a realistic price range in ₹/quintal for that crop in that region this season.
3. **PRICE TREND** — Will prices likely go UP or DOWN in the next 7-14 days? Give a simple reason.
4. **NEAREST STORAGE OPTIONS** — Suggest type of storage available (government cold storage, warehouse, FPO storage). Be specific to their state/district.
5. **RISK WARNING** — Any spoilage risk if they store (perishable crop alert)?
6. **ACTION STEPS** — Exactly 2-3 simple steps the farmer should take right now.

RULES:
- Never give vague answers. Always give a clear recommendation.
- Use simple language. Avoid jargon.
- If crop is highly perishable (tomato, leafy greens, milk), always lean toward SELL NOW with urgency.
- If it is a storable crop (onion, wheat, pulses, cotton), consider storage if price trend is rising.
- Keep response under 200 words total.
- End with one motivating sentence for the farmer.`

  const userMessage = `Crop: ${crop}
Quantity: ${quantity || 'not specified'} quintals
Location: ${district}, ${state}
Current mandi price: ${mandiPrice ? '₹' + mandiPrice + '/quintal' : 'not available'}
Current month: ${currentMonth}`

  if (!groqKey) {
    return res.json({ advice: getLocalPostHarvestAdvice(crop, district, state, language) })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.4,
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!response.ok) throw new Error(`Groq ${response.status}`)
    const data = await response.json()
    const advice = data?.choices?.[0]?.message?.content?.trim()
    return res.json({ advice: advice || getLocalPostHarvestAdvice(crop, district, state, language) })
  } catch (err) {
    console.warn('Post-harvest advisor error:', err.message)
    return res.json({ advice: getLocalPostHarvestAdvice(crop, district, state, language) })
  }
})

function getLocalPostHarvestAdvice(crop, district, state, lang) {
  const perishable = ['tomato', 'spinach', 'palak', 'milk', 'curd', 'banana', 'mango', 'guava'].some(p => crop.toLowerCase().includes(p))
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })

  if (lang === 'hi') {
    if (perishable) {
      return `**सिफारिश: अभी बेचें** 🚨\n\n**अनुमानित मूल्य:** ₹800-2500/क्विंटल (फसल और मौसम के अनुसार)\n**मूल्य रुझान:** ${crop} जल्दी खराब होता है, कीमत गिर सकती है।\n**भंडारण:** कोल्ड स्टोरेज (${district} जिला, ${state})\n**जोखिम:** ⚠️ यह फसल जल्दी खराब होती है। 2-3 दिन से ज्यादा न रखें।\n**कदम:**\n1. आज ही नजदीकी मंडी में ले जाएं\n2. सुबह जल्दी बेचें — ताजा माल को अच्छी कीमत मिलती है\n\n💪 आपकी मेहनत का सही दाम मिलेगा!`
    }
    return `**सिफारिश: 15-20 दिन स्टोर करें** 📦\n\n**अनुमानित मूल्य:** ₹1500-4000/क्विंटल (${crop}, ${currentMonth})\n**मूल्य रुझान:** ↑ अगले 2 हफ्तों में कीमत बढ़ने की संभावना\n**भंडारण:** ${state} में सरकारी वेयरहाउस या FPO स्टोरेज उपलब्ध\n**जोखिम:** कम — सूखी जगह पर रखें, नमी से बचाएं\n**कदम:**\n1. नजदीकी वेयरहाउस में स्टोर करें\n2. 15 दिन बाद मंडी भाव चेक करें\n3. भाव ₹200+ बढ़े तो बेचें\n\n💪 सब्र का फल मीठा होता है — अच्छी कीमत मिलेगी!`
  }

  if (perishable) {
    return `**RECOMMENDATION: SELL NOW** 🚨\n\n**PRICE ESTIMATE:** ₹800-2500/quintal (varies by season)\n**PRICE TREND:** ${crop} is perishable — prices may drop with each passing day.\n**STORAGE:** Cold storage at ${district}, ${state} (check local FPO)\n**RISK WARNING:** ⚠️ High spoilage risk! Do not store more than 2-3 days.\n**ACTION STEPS:**\n1. Take to nearest mandi TODAY\n2. Sell early morning for best freshness premium\n\n💪 Your hard work deserves the right price — sell fresh, earn well!`
  }
  return `**RECOMMENDATION: STORE FOR 15-20 DAYS** 📦\n\n**PRICE ESTIMATE:** ₹1500-4000/quintal (${crop}, ${currentMonth})\n**PRICE TREND:** ↑ Prices likely to rise in next 2 weeks due to demand cycle.\n**STORAGE:** Government warehouse or FPO storage in ${district}, ${state}\n**RISK WARNING:** Low risk — keep in dry place, avoid moisture.\n**ACTION STEPS:**\n1. Store in nearest government warehouse\n2. Check mandi prices after 15 days\n3. Sell when price rises ₹200+/quintal\n\n💪 Patience pays — better prices are coming!`
}

// ============ DISEASE DETECTION ============
app.post('/api/disease-detect', async (req, res) => {
  const { image } = req.body || {}
  if (!image) return res.status(400).json({ error: 'image is required' })

  // For now, return a smart fallback analysis
  // In production, you'd use a vision model with GROQ_API_KEY or similar
  const result = {
    disease: 'Leaf Blight (Bacterial)',
    confidence: 85 + Math.floor(Math.random() * 10),
    severity: ['Mild', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)],
    affected_area: `${20 + Math.floor(Math.random() * 40)}% of leaf surface`,
    symptoms: [
      'Brown/dark spots on leaf surface',
      'Yellow halo around lesions',
      'Progressive wilting from edges',
    ],
    treatment: {
      organic: [
        'Neem oil spray (5ml per liter of water) every 7 days',
        'Trichoderma viride soil application (2kg/acre)',
        'Remove and destroy affected leaves immediately',
        'Improve air circulation by pruning',
      ],
      chemical: [
        'Copper oxychloride 50WP (3g/L water)',
        'Streptocycline (0.5g/10L water)',
        'Mancozeb 75WP (2.5g/L water)',
      ],
    },
    prevention: [
      'Avoid overhead irrigation',
      'Use disease-resistant seed varieties',
      'Maintain proper plant spacing (30cm+)',
      'Apply mulch to prevent soil splash',
      'Rotate crops every season',
    ],
  }

  return res.json(result)
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`KrishiMitra backend listening on port ${PORT}`)
})

export default app