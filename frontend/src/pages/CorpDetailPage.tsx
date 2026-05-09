import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { corpsApi, usersApi, invitationsApi } from '../api'
import { useGlobalToast } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import type { Corp, User, Invitation } from '../types'

export function CorpDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useGlobalToast()
  const { user } = useAuthStore()
  const [corp, setCorp] = useState<Corp | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([])
  const [sending, setSending] = useState(false)

  const corpId = Number(id)

  const loadData = () => {
    if (!corpId) return
    Promise.all([
      corpsApi.getById(corpId),
      corpsApi.getMembers(corpId),
      usersApi.getAll(),
    ])
      .then(([c, mIds, users]) => {
        setCorp(c)
        setMembers(users.filter((u: User) => mIds.includes(u.user_id)))
      })
      .finally(() => setLoading(false))
    invitationsApi.getPendingForCorp(corpId).then(setPendingInvites).catch(() => {})
  }

  useEffect(() => {
    loadData()
  }, [corpId])

  const handleRemoveMember = async (userId: number) => {
    try {
      await corpsApi.removeMember(corpId, userId)
      setMembers((prev) => prev.filter((u) => u.user_id !== userId))
      showToast('Member removed', 'success')
    } catch {
      showToast('Failed to remove member', 'error')
    }
  }

  const handleSendInvite = async () => {
    if (!username.trim()) return
    setSending(true)
    try {
      await invitationsApi.sendInvite(corpId, { username: username.trim() })
      showToast(`Invitation sent to '${username.trim()}'`, 'success')
      setUsername('')
      const invites = await invitationsApi.getPendingForCorp(corpId)
      setPendingInvites(invites)
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to send invitation'
      showToast(detail, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this corporation? This cannot be undone.')) return
    try {
      await corpsApi.delete(corpId)
      showToast('Corporation deleted', 'success')
      navigate('/corps')
    } catch {
      showToast('Failed to delete corporation', 'error')
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-zinc-200 rounded-lg animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200/70 h-32 animate-pulse" />
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200/70 h-48 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!corp) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm" role="alert">
          Corporation not found
        </div>
      </div>
    )
  }

  const isOwner = user?.user_id === corp.owner_id

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/corps')}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-zinc-800">{corp.name}</h1>
      </div>

      {isOwner && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200/70 border-l-4 border-l-rose-500 p-6 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Owner ID <span className="tabular-nums">{corp.owner_id}</span> &middot; Created{' '}
                {new Date(corp.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 bg-rose-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-all duration-200 active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Corporation
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-zinc-200/70 border-l-4 border-l-amber-500 p-6 mb-4">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4">Invite Member</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username…"
                spellCheck={false}
                autoComplete="off"
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400"
              />
              <button
                onClick={handleSendInvite}
                disabled={!username.trim() || sending}
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  'Send Invite'
                )}
              </button>
            </div>

            {pendingInvites.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <p className="text-sm text-zinc-500 mb-2">Pending invitations:</p>
                <ul className="space-y-1">
                  {pendingInvites.map((inv) => (
                    <li key={inv.invitation_id} className="flex items-center gap-2 py-2 px-3 bg-amber-50 rounded-lg text-sm text-zinc-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
                      Invited {inv.recipient_username} &mdash; waiting for response
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200/70 border-l-4 border-l-indigo-500 p-6">
        <h2 className="text-lg font-semibold text-zinc-800 mb-4">
          Members{' '}
          <span className="text-zinc-400 font-normal">({members.length})</span>
        </h2>

        {members.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-8">No members yet</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {members.map((member) => (
              <li key={member.user_id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                    {member.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-800 text-sm">{member.username}</p>
                    <p className="text-xs text-zinc-400">{member.email}</p>
                  </div>
                </div>
                {isOwner && member.user_id !== corp.owner_id && (
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
