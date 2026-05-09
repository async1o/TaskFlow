const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
}

const avatarColors = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-teal-500',
]

function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const imgSrc = src?.startsWith('/static/') ? `${API_URL}${src}` : src

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={name ? `${name}'s avatar` : 'User avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${name ? getColor(name) : 'bg-zinc-400'} flex items-center justify-center text-white font-medium shadow-sm ring-2 ring-white`}
      aria-hidden={!name}
    >
      {initials}
    </div>
  )
}
