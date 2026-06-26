import { useState, useEffect } from "react"
import Auth from "./Auth"
import FarmerDashboard from "./FarmerDashboard"
import Marketplace from "./Marketplace"
import AdminPanel from "./AdminPanel"
import Profile from './Profile'
import LandingPage from './LandingPage'
import LanguageSelector from './components/LanguageSelector'
import DarkModeToggle from './components/DarkModeToggle'
import AIAssistant from './components/AIAssistant'
import DiseaseDetection from './components/DiseaseDetection'
import { useLanguage } from './i18n/LanguageContext'
import { supabase } from './supabase'
import logo from "./assets/krishimitra-logo.png"

function App() {
  const { t } = useLanguage()
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [page, setPage] = useState("home")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUserRole(session.user.id)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUserRole(session.user.id)
      else setUserRole(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (data) setUserRole(data.role)
  }

  const handleLogin = (u) => {
    setUser(u)
    fetchUserRole(u.id)
    setPage("home")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    setPage("home")
  }

  const requireAuth = (nextPage) => {
    if (!user) {
      setPage("auth")
      return false
    }
    setPage(nextPage)
    return true
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center text-gray-500">
        {t('loading')}
      </div>
    )
  }

  const Navbar = () => (
    <nav className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage("home")}>
            <img src={logo} alt="KrishiMitra" className="w-9 h-9" />
            <h1 className="text-lg font-bold text-green-700 dark:text-green-400">KrishiMitra</h1>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setPage("marketplace")} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium transition-colors">{t('marketplace')}</button>
            <button onClick={() => setPage("disease")} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium transition-colors">🔬 Disease Detection</button>
            {user && userRole === 'farmer' && <button onClick={() => requireAuth('farmer')} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium transition-colors">{t('farmerDashboard')}</button>}
            {user && isAdmin && <button onClick={() => setPage("admin")} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium transition-colors">{t('admin')}</button>}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-300">{user.email?.[0]?.toUpperCase() || '?'}</div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-12 z-50 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{userRole || 'consumer'}</p>
                      </div>
                      <div className="md:hidden py-1 border-b border-gray-100 dark:border-gray-700">
                        <button onClick={() => { setPage("marketplace"); setShowUserMenu(false) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">🛒 {t('marketplace')}</button>
                        <button onClick={() => { setPage("disease"); setShowUserMenu(false) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">🔬 Disease Detection</button>
                        {userRole === 'farmer' && <button onClick={() => { requireAuth('farmer'); setShowUserMenu(false) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">👨‍🌾 {t('farmerDashboard')}</button>}
                        {isAdmin && <button onClick={() => { setPage("admin"); setShowUserMenu(false) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">🛡️ {t('admin')}</button>}
                      </div>
                      <div className="py-1">
                        <button onClick={() => { requireAuth('profile'); setShowUserMenu(false) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">👤 {t('profile')}</button>
                        <div className="px-4 py-2 flex items-center justify-between"><span className="text-sm text-gray-700 dark:text-gray-300">🌐 Language</span><LanguageSelector /></div>
                        <div className="px-4 py-2 flex items-center justify-between"><span className="text-sm text-gray-700 dark:text-gray-300">🌙 Theme</span><DarkModeToggle /></div>
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                        <button onClick={() => { handleLogout(); setShowUserMenu(false) }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">↪ {t('logout')}</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setPage("auth")} className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm font-medium">{t('login')}</button>
                <button onClick={() => setPage("auth")} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm">{t('signUp')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )

  const BackButton = ({ onClick }) => (
    <div className="px-4 sm:px-6 pt-4">
      <button
        onClick={onClick || (() => setPage("home"))}
        className="flex items-center gap-2 text-green-700 hover:text-green-900 font-medium mb-2"
      >
        {t('backToHome')}
      </button>
    </div>
  )

  if (page === "auth") {
    return <Auth onLogin={handleLogin} />
  }

  if (page === "farmer" && user) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navbar />
        <BackButton onClick={() => setPage("home")} />
        <FarmerDashboard user={user} />
        <AIAssistant user={user} />
      </div>
    )
  }

  if (page === 'profile' && user) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navbar />
        <BackButton onClick={() => setPage("home")} />
        <Profile user={user} />
      </div>
    )
  }

  if (page === "marketplace") {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navbar />
        <BackButton onClick={() => setPage("home")} />
        <Marketplace user={user} />
        <AIAssistant user={user} />
      </div>
    )
  }

  if (page === "disease") {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navbar />
        <BackButton onClick={() => setPage("home")} />
        <DiseaseDetection user={user} />
        <AIAssistant user={user} />
      </div>
    )
  }

  if (page === "admin" && user && isAdmin) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navbar />
        <BackButton onClick={() => setPage("home")} />
        <AdminPanel user={user} onBack={() => setPage("home")} />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <LandingPage user={user} setPage={setPage} />
    </div>
  )
}

export default App
