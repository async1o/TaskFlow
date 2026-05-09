import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full px-3.5 py-2.5 rounded-lg border transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-zinc-300 focus:border-indigo-500 focus:ring-indigo-200 hover:border-zinc-400'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-rose-500 text-sm mt-1.5 flex items-center gap-1" role="alert">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
