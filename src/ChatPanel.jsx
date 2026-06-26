import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import { useLanguage } from './i18n/LanguageContext'

function ChatPanel({ user, contacts = [], onClose }) {
  const { t } = useLanguage()
  const [messagesByPeer, setMessagesByPeer] = useState({})
  const [activePeerId, setActivePeerId] = useState(contacts[0]?.id || '')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [unreadByPeer, setUnreadByPeer] = useState({})
  const [profiles, setProfiles] = useState({})
  const [showSidebar, setShowSidebar] = useState(true)

  const mergedContacts = useMemo(() => {
    const byId = {}
    contacts.forEach((c) => {
      if (!c?.id) return
      byId[c.id] = { id: c.id, label: c.label || c.name || c.id }
    })

    Object.keys(messagesByPeer).forEach((peerId) => {
      if (!byId[peerId]) byId[peerId] = { id: peerId, label: profiles[peerId] || peerId }
    })

    return Object.values(byId).map((c) => ({
      ...c,
      label: profiles[c.id] || c.label,
      unread: unreadByPeer[c.id] || 0,
      lastAt: messagesByPeer[c.id]?.[messagesByPeer[c.id].length - 1]?.created_at || '',
    })).sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)))
  }, [contacts, messagesByPeer, profiles, unreadByPeer])

  useEffect(() => {
    if (!activePeerId && mergedContacts.length > 0) {
      setActivePeerId(mergedContacts[0].id)
    }
  }, [activePeerId, mergedContacts])

  const fetchProfiles = async (ids) => {
    const uniqueIds = [...new Set(ids.filter(id => id && !id.startsWith('sample-')))]
    if (uniqueIds.length === 0) return
    const { data } = await supabase.from('profiles').select('id, full_name').in('id', uniqueIds)
    if (!data) return
    const map = {}
    data.forEach((p) => { map[p.id] = p.full_name || p.id })
    setProfiles((prev) => ({ ...prev, ...map }))
  }

  const mergeAndSort = (a = [], b = []) => {
    const map = new Map()
    ;[...a, ...b].forEach((m) => map.set(m.id, m))
    return Array.from(map.values()).sort((x, y) => new Date(x.created_at) - new Date(y.created_at))
  }

  const fetchPeerMessages = async (peerId) => {
    if (!peerId || !user?.id) return []
    // Skip Supabase queries for sample/demo farmer IDs
    if (peerId.startsWith('sample-')) {
      setMessagesByPeer((prev) => ({ ...prev, [peerId]: [] }))
      setUnreadByPeer((prev) => ({ ...prev, [peerId]: 0 }))
      return []
    }
    const [sent, received] = await Promise.all([
      supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', peerId)
        .order('created_at', { ascending: true }),
      supabase
        .from('messages')
        .select('*')
        .eq('sender_id', peerId)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: true }),
    ])

    const combined = mergeAndSort(sent.data, received.data)
    setMessagesByPeer((prev) => ({ ...prev, [peerId]: combined }))

    const unreadCount = combined.filter((m) => m.receiver_id === user.id && !m.is_read).length
    setUnreadByPeer((prev) => ({ ...prev, [peerId]: unreadCount }))

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', peerId)
      .eq('receiver_id', user.id)
      .eq('is_read', false)

    setUnreadByPeer((prev) => ({ ...prev, [peerId]: 0 }))
    return combined
  }

  const refreshAll = async () => {
    if (!user?.id) return
    setLoading(true)
    const peerIds = mergedContacts.map((c) => c.id)
    await fetchProfiles(peerIds)
    await Promise.all(peerIds.map((peerId) => fetchPeerMessages(peerId)))
    setLoading(false)
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, contacts.length])

  useEffect(() => {
    if (!user?.id) return
    const incomingChannel = supabase
      .channel(`chat-in-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        async (payload) => {
          const peerId = payload.new?.sender_id || payload.old?.sender_id
          if (peerId) await fetchPeerMessages(peerId)
        }
      )
      .subscribe()

    const outgoingChannel = supabase
      .channel(`chat-out-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `sender_id=eq.${user.id}` },
        async (payload) => {
          const peerId = payload.new?.receiver_id || payload.old?.receiver_id
          if (peerId) await fetchPeerMessages(peerId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(incomingChannel)
      supabase.removeChannel(outgoingChannel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const sendMessage = async () => {
    if (!draft.trim() || !activePeerId || !user?.id) return
    setSending(true)
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activePeerId,
      content: draft.trim(),
      is_read: false,
    })
    setDraft('')
    await fetchPeerMessages(activePeerId)
    setSending(false)
  }

  const selectPeer = (id) => {
    setActivePeerId(id)
    setShowSidebar(false)
  }

  const activeMessages = messagesByPeer[activePeerId] || []

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="hidden sm:block flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full sm:max-w-2xl bg-white h-full shadow-2xl flex overflow-hidden">
        {/* Contact List Sidebar */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} sm:flex w-full sm:w-72 border-r border-gray-200 flex-col`}>
          <div className="px-4 py-3 bg-green-700 text-white font-bold flex justify-between items-center">
            <span>💬 {t('messages')}</span>
            <button onClick={onClose} className="text-white text-xl sm:hidden">×</button>
          </div>
          <div className="overflow-y-auto flex-1">
            {mergedContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-500 text-sm">{t('noChats')}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Buy a product or place an order to start chatting with farmers
                </p>
              </div>
            ) : mergedContacts.map((c) => (
              <button
                key={c.id}
                onClick={() => selectPeer(c.id)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-green-50 transition ${activePeerId === c.id ? 'bg-green-100 border-l-4 border-l-green-600' : ''}`}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-sm">
                      {c.label?.[0]?.toUpperCase() || '?'}
                    </span>
                    <span className="font-medium text-gray-800 truncate">{c.label}</span>
                  </div>
                  {c.unread > 0 && (
                    <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{c.unread}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${!showSidebar ? 'flex' : 'hidden'} sm:flex flex-1 flex-col`}>
          <div className="px-4 py-3 border-b flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(true)}
                className="sm:hidden text-green-700 font-bold text-lg mr-1"
              >
                ←
              </button>
              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-sm font-bold">
                {(profiles[activePeerId] || mergedContacts.find(c => c.id === activePeerId)?.label || '?')[0]?.toUpperCase()}
              </div>
              <p className="font-semibold text-gray-800">
                {profiles[activePeerId] || mergedContacts.find(c => c.id === activePeerId)?.label || t('selectChat')}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500">{t('loadingMessages')}</p>
              </div>
            ) : !activePeerId ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-sm">{t('selectChat')}</p>
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-4xl mb-3">👋</p>
                <p className="text-sm">{t('noMessages')}</p>
                {activePeerId?.startsWith('sample-') && (
                  <p className="text-xs mt-2 text-center px-4 text-gray-400">This is a demo farmer. Messages will work with real farmers after they sign up.</p>
                )}
              </div>
            ) : activeMessages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  m.sender_id === user.id
                    ? 'ml-auto bg-green-600 text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.content || m.message || ''}</p>
                <p className={`text-[10px] mt-1 ${m.sender_id === user.id ? 'text-green-200' : 'text-gray-400'}`}>
                  {new Date(m.created_at).toLocaleString('en-IN', {
                    hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
                  })}
                </p>
              </div>
            ))}
          </div>

          {activePeerId && (
            <div className="border-t p-3 flex gap-2 bg-white">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={t('typeMessage')}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !activePeerId || !draft.trim()}
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 hover:bg-green-700 transition"
              >
                {sending ? '...' : t('send')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
