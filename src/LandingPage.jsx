import { useLanguage } from './i18n/LanguageContext'
import AIAssistant from './components/AIAssistant'

function LandingPage({ user, setPage }) {
  const { t } = useLanguage()

  return (
    <div className="bg-[#F8FFF8] dark:bg-gray-950">

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden min-h-[500px] lg:min-h-[550px]">
        <div className="absolute inset-0">
          <img src="/farm-field.jpg" alt="" className="w-full h-full object-cover brightness-[0.9]" />
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F8FFF8] dark:from-gray-950"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left */}
            <div className="lg:col-span-5 z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                🌱 {t('aiPoweredBadge')}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-extrabold text-white leading-tight mb-4" style={{textShadow:'0 2px 10px rgba(0,0,0,0.4)'}}>
                {t('heroHeading')}{' '}
                <span className="text-green-300">{t('heroHeadingHighlight')}</span>
              </h1>
              <p className="text-white/90 text-sm sm:text-base mb-7 max-w-md leading-relaxed" style={{textShadow:'0 1px 6px rgba(0,0,0,0.3)'}}>
                {t('heroDescription')}
              </p>
              <div className="flex gap-3 flex-wrap">
                <button onClick={()=>setPage("marketplace")} className="bg-[#16A34A] hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:scale-[1.03] active:scale-[0.97] text-sm">
                  🛒 {t('shopNow')}
                </button>
                <button onClick={()=> user ? setPage("farmer") : setPage("auth")} className="bg-white/90 backdrop-blur border-2 border-white/50 text-gray-800 font-semibold px-6 py-3 rounded-xl hover:bg-white transition-all text-sm dark:bg-green-700 dark:border-green-600 dark:text-white dark:hover:bg-green-600">
                  🌾 {t('sellProduce')}
                </button>
                <button onClick={()=>setPage("marketplace")} className="bg-white/20 backdrop-blur border border-white/40 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/30 transition-all text-sm">
                  🔍 {t('exploreMarketplace')}
                </button>
              </div>
            </div>

            {/* Center - Farmer */}
            <div className="hidden lg:flex lg:col-span-3 justify-center z-10">
              <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=400&fit=crop&crop=top" alt="Farmer" className="h-[360px] object-cover animate-float" style={{filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.2))'}} onError={(e)=>{e.target.src='/farmer-hero.svg'}} />
            </div>

            {/* Right - Market Prices */}
            <div className="lg:col-span-4 z-10 flex justify-end">
              <div className="backdrop-blur-xl bg-white dark:bg-gray-800 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.6)] dark:shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/80 dark:border-gray-700/50 p-5 w-full max-w-[280px]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">📈 {t('liveMarketPrices')}</h4>
                  <span className="text-[10px] text-[#16A34A] font-semibold cursor-pointer" onClick={()=>setPage("marketplace")}>{t('viewAll')}</span>
                </div>
                {[
                  {e:'🍅',n:'Tomato',p:24,t:'up',c:5},
                  {e:'🥔',n:'Potato',p:18,t:'down',c:3},
                  {e:'🧅',n:'Onion',p:22,t:'up',c:3},
                  {e:'🌾',n:'Wheat',p:28,t:'up',c:4},
                  {e:'🍚',n:'Rice',p:32,t:'up',c:1},
                ].map(i=>(
                  <div key={i.n} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-2"><span>{i.e}</span><span className="text-xs font-medium text-gray-700 dark:text-gray-300">{i.n}</span></div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">₹{i.p}/kg</span>
                      <span className={`text-[10px] font-bold ${i.t==='up'?'text-green-500':'text-red-500'}`}>{i.t==='up'?`↑${i.c}%`:`↓${i.c}%`}</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-3">
                  <p className="text-[9px] text-gray-400">🕐 {t('updatedMinAgo')}</p>
                  <button onClick={()=>setPage("marketplace")} className="text-[10px] bg-[#16A34A] text-white px-2.5 py-1 rounded-md font-medium">{t('viewFullMarket')}</button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="relative z-10 mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {icon:'🌐',val:'10,000+',label:t('farmersConnected')},
              {icon:'📦',val:'25,000+',label:t('ordersDelivered')},
              {icon:'🌾',val:'150+',label:t('cropsSupported')},
              {icon:'🏘️',val:'100+',label:t('villagesCovered')},
            ].map(s=>(
              <div key={s.label} className="flex items-center gap-2 bg-white dark:bg-gray-800 backdrop-blur rounded-xl px-4 py-3 border border-white/80 dark:border-gray-700 shadow-[0_0_20px_rgba(255,255,255,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <span className="text-lg">{s.icon}</span>
                <div><p className="text-sm font-extrabold text-gray-900 dark:text-white">{s.val}</p><p className="text-[10px] text-gray-500">{s.label}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES BAR ══════════ */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              {icon:'🏪',title:t('smartMarketplace'),desc:t('smartMarketplaceDesc')},
              {icon:'💬',title:t('chatWithFarmers'),desc:t('chatWithFarmersDesc')},
              {icon:'✅',title:t('securePayments'),desc:t('securePaymentsDesc')},
              {icon:'🌤️',title:t('weatherIntelligence'),desc:t('weatherIntelligenceDesc')},
              {icon:'📦',title:t('orderTracking'),desc:t('orderTrackingDesc')},
              {icon:'🛡️',title:t('qualityAssurance'),desc:t('qualityAssuranceDesc')},
            ].map((f,i)=>(
              <div key={i} className="text-center group cursor-pointer" onClick={()=>setPage("marketplace")}>
                <div className="w-14 h-14 mx-auto mb-3 bg-[#DCFCE7] dark:bg-green-900/40 rounded-full flex items-center justify-center text-xl group-hover:scale-110 group-hover:shadow-md transition-all duration-300">{f.icon}</div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{f.title}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SHOP BY CATEGORY ══════════ */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h3 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-8">🌿 {t('shopByCategory')} 🌿</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {name:t('vegetables'),desc:t('catDescVegetables'),img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=200&fit=crop',bg:'from-green-100 to-green-200'},
            {name:t('fruits'),desc:t('catDescFruits'),img:'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=200&fit=crop',bg:'from-red-50 to-orange-100'},
            {name:t('grains'),desc:t('catDescGrains'),img:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=200&fit=crop',bg:'from-amber-50 to-yellow-100'},
            {name:t('dairy'),desc:t('catDescDairy'),img:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=200&fit=crop',bg:'from-blue-50 to-sky-100'},
            {name:t('spices'),desc:t('catDescSpices'),img:'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=200&fit=crop',bg:'from-orange-50 to-red-50'},
            {name:t('seeds'),desc:t('catDescSeeds'),img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop',bg:'from-emerald-50 to-teal-100'},
          ].map(c=>(
            <div key={c.name} onClick={()=>setPage("marketplace")} className={`bg-gradient-to-br ${c.bg} dark:from-gray-800 dark:to-gray-700 rounded-2xl overflow-hidden cursor-pointer border border-gray-100 dark:border-gray-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
              <div className="h-28 overflow-hidden">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-3">
                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{c.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{c.desc}</p>
                <div className="mt-2 w-6 h-6 bg-[#16A34A] rounded-full flex items-center justify-center"><span className="text-white text-[10px]">→</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ AI ASSISTANT + WEATHER ══════════ */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Assistant Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#DCFCE7] rounded-full flex items-center justify-center">🤖</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{t('aiAssistantTitle')}</h4>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span><span className="text-[10px] text-gray-500">{t('aiOnline')}</span></div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">{t('aiGreeting')}</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {[t('aiPrompt1'),t('aiPrompt2'),t('aiPrompt3'),t('aiPrompt4')].map(q=>(
                <span key={q} className="text-[10px] bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 px-2.5 py-1 rounded-full">{q}</span>
              ))}
            </div>
            <button onClick={()=>setPage("disease")} className="bg-[#16A34A] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors">💬 {t('chatNow')}</button>
          </div>

          {/* Weather Widget */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{t('todaysWeather')}</h4>
              <span className="text-[10px] text-gray-500 flex items-center gap-1">📍 Amravati, MH</span>
            </div>
            <div className="flex items-center gap-6 mb-5">
              <div>
                <p className="text-5xl font-extrabold text-gray-900 dark:text-white">28°C</p>
                <p className="text-xs text-gray-500 mt-1">{t('partlyCloudy')}</p>
              </div>
              <div className="text-5xl">⛅</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500">{t('humidityLabel')}</p><p className="text-sm font-bold text-gray-800 dark:text-white">65%</p></div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500">{t('windLabel')}</p><p className="text-sm font-bold text-gray-800 dark:text-white">12 km/h</p></div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500">{t('rainChance')}</p><p className="text-sm font-bold text-gray-800 dark:text-white">20%</p></div>
            </div>
            <div className="space-y-2">
              {[{d:t('tomorrow'),t:'30°/22°'},{d:'Wed',t:'29°/21°'},{d:'Thu',t:'28°/20°'},{d:'Fri',t:'27°/19°'}].map(f=>(
                <div key={f.d} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{f.d}</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-white">{f.t}</span>
                </div>
              ))}
            </div>
            <button onClick={()=> user ? setPage("farmer") : setPage("auth")} className="mt-4 text-xs border border-[#16A34A] text-[#16A34A] px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors w-full">{t('viewFullForecast')}</button>
          </div>
        </div>
      </section>

      {/* ══════════ WHY CHOOSE US ══════════ */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h3 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-8">{t('whyChooseKrishiMitra')} 🌾</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {icon:'🚫',title:t('noMiddlemen'),desc:t('noMiddlemenDesc')},
            {icon:'✨',title:t('bestQuality'),desc:t('bestQualityDesc')},
            {icon:'📊',title:t('livePrices'),desc:t('livePricesDesc')},
            {icon:'🌧️',title:t('weatherAlerts'),desc:t('weatherAlertsDesc')},
            {icon:'🔒',title:t('securePaymentsShort'),desc:t('securePaymentsShortDesc')},
            {icon:'🤝',title:t('farmerSupport'),desc:t('farmerSupportDesc')},
          ].map((f,i)=>(
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 mx-auto mb-2 bg-[#DCFCE7] dark:bg-green-900/40 rounded-full flex items-center justify-center text-lg">{f.icon}</div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{f.title}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h3 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-8">{t('whatFarmersSay')} 🌾</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {name:t('testimonial1Name'),loc:t('testimonial1Loc'),text:t('testimonial1Text'),stars:5},
            {name:t('testimonial2Name'),loc:t('testimonial2Loc'),text:t('testimonial2Text'),stars:5},
            {name:t('testimonial3Name'),loc:t('testimonial3Loc'),text:t('testimonial3Text'),stars:5},
          ].map((item,i)=>(
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-lg font-bold text-green-700">{item.name[0]}</div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.name}</p>
                  <p className="text-[10px] text-gray-500">{item.loc}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">{Array(item.stars).fill(0).map((_,j)=>(<span key={j} className="text-yellow-400 text-xs">★</span>))}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">&ldquo;{item.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ NEWSLETTER ══════════ */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-[#16A34A] to-[#059669] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1 text-white">
            <h4 className="font-extrabold text-lg">{t('stayUpdated')}</h4>
            <p className="text-green-100 text-xs mt-1">{t('newsletterDesc')}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input placeholder={t('enterYourEmail')} className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button className="bg-white text-[#16A34A] font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors whitespace-nowrap">{t('subscribe')}</button>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-gray-900 text-white mt-10 rounded-t-3xl">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <h5 className="font-extrabold text-lg text-white mb-2">🌾 KrishiMitra</h5>
              <p className="text-xs text-gray-400 leading-relaxed">{t('footerTagline')}</p>
              <div className="flex gap-3 mt-3">
                {['f','📷','🐦','▶'].map((s,i)=>(<div key={i} className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-400 hover:bg-green-600 hover:text-white transition-colors cursor-pointer">{s}</div>))}
              </div>
            </div>
            <div>
              <h6 className="font-bold text-sm mb-3 text-gray-200">{t('quickLinks')}</h6>
              <div className="space-y-1.5">{[t('footerHome'),t('footerMarketplace'),t('footerSchemes'),t('footerWeather'),t('footerDashboard')].map(l=>(<p key={l} className="text-xs text-gray-400 hover:text-green-400 cursor-pointer transition-colors">{l}</p>))}</div>
            </div>
            <div>
              <h6 className="font-bold text-sm mb-3 text-gray-200">{t('support')}</h6>
              <div className="space-y-1.5">{[t('contactUs'),t('helpCenter'),t('privacyPolicy'),t('termsConditions'),t('faqs')].map(l=>(<p key={l} className="text-xs text-gray-400 hover:text-green-400 cursor-pointer transition-colors">{l}</p>))}</div>
            </div>
            <div>
              <h6 className="font-bold text-sm mb-3 text-gray-200">{t('categories')}</h6>
              <div className="space-y-1.5">{[t('vegetables'),t('fruits'),t('grains'),t('dairy'),t('seeds')].map(l=>(<p key={l} className="text-xs text-gray-400 hover:text-green-400 cursor-pointer transition-colors">{l}</p>))}</div>
            </div>
            <div>
              <h6 className="font-bold text-sm mb-3 text-gray-200">{t('downloadApp')}</h6>
              <div className="space-y-2">
                <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-700 transition-colors">
                  <span>▶</span><div><p className="text-[9px] text-gray-400">{t('getItOn')}</p><p className="text-xs font-bold">{t('googlePlay')}</p></div>
                </div>
                <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-700 transition-colors">
                  <span>🍎</span><div><p className="text-[9px] text-gray-400">{t('downloadOnThe')}</p><p className="text-xs font-bold">{t('appStore')}</p></div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-500">{t('copyright')}</p>
            <p className="text-xs text-gray-500">{t('madeWithLove')}</p>
          </div>
        </div>
      </footer>

      <AIAssistant user={user} />
    </div>
  )
}

export default LandingPage
