import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { corpsApi } from '../api'
import type { Corp } from '../types'

export function CorpsPage() {
  const navigate = useNavigate()
  const [corps, setCorps] = useState<Corp[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    corpsApi.getAll().then(setCorps).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      const id = await corpsApi.create({ name: name.trim() })
      navigate(`/corps/${id}`)
    } catch {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Corporations</h1>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200/70">
              <div className="h-5 w-40 bg-zinc-200 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-24 bg-zinc-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-zinc-800">Corporations</h1>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New corporation name…"
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400"
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
        >
          {creating ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating…
            </>
          ) : (
            'Create'
          )}
        </button>
      </form>

      {corps.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-zinc-200/70">
          <div className="text-4xl mb-4 opacity-30">🏢</div>
          <p className="text-lg text-zinc-500 mb-2">No corporations yet</p>
          <p className="text-sm text-zinc-400">Create one above to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {corps.map((corp, index) => (
            <Link
              key={corp.corp_id}
              to={`/corps/${corp.corp_id}`}
              className="block bg-white rounded-xl shadow-sm border border-zinc-200/70 border-l-4 border-l-amber-500 p-5 transition-all duration-200 hover:shadow-md hover:border-l-amber-600"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                  {corp.name[0]?.toUpperCase() || 'C'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg text-zinc-800 truncate">{corp.name}</h3>
                  <p className="text-sm text-zinc-400">
                    Created {new Date(corp.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
