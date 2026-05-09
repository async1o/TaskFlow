import { useEffect, useState } from 'react'
import { notificationsApi, invitationsApi } from '../api'
import { useGlobalToast } from '../components/ui'
import type { NotificationItem } from '../api'

export function NotificationsPage() {
  const { showToast } = useGlobalToast()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    notificationsApi
      .getAll()
      .then(setItems)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAccept = async (item: NotificationItem) => {
    if (!item.invitation_id) return
    try {
      await invitationsApi.accept(item.invitation_id)
      showToast('Invitation accepted', 'success')
      load()
    } catch {
      showToast('Failed to accept invitation', 'error')
    }
  }

  const handleReject = async (item: NotificationItem) => {
    if (!item.invitation_id) return
    try {
      await invitationsApi.reject(item.invitation_id)
      showToast('Invitation rejected', 'success')
      load()
    } catch {
      showToast('Failed to reject invitation', 'error')
    }
  }

  const handleMarkRead = async (item: NotificationItem) => {
    if (item.type === 'invitation' || !item.notification_id) return
    try {
      await notificationsApi.markRead(item.notification_id)
      load()
    } catch {
      // silent
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Notifications</h1>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200/70">
              <div className="flex gap-3">
                <div className="h-5 w-16 bg-zinc-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-zinc-200 rounded-lg animate-pulse" />
                  <div className="h-3 w-24 bg-zinc-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200/70 p-12 text-center">
          <div className="text-4xl mb-3 opacity-30">🔔</div>
          <p className="text-zinc-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border transition-all duration-200 ${
                !item.read
                  ? 'bg-indigo-50/80 border-l-4 border-l-indigo-500 shadow-sm'
                  : 'bg-white border border-zinc-200/70 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between p-4 md:p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.type === 'invitation' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                        Invite
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" aria-hidden="true" />
                        Task
                      </span>
                    )}
                    <p className="font-medium text-zinc-800 text-sm truncate">{item.message}</p>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  {item.type === 'invitation' ? (
                    <>
                      <button
                        onClick={() => handleAccept(item)}
                        className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all duration-200 active:scale-[0.97]"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        className="inline-flex items-center gap-1 bg-rose-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-all duration-200 active:scale-[0.97]"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </>
                  ) : !item.read ? (
                    <button
                      onClick={() => handleMarkRead(item)}
                      className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
