import { useState, useRef } from 'react'
import { Avatar } from './Avatar'

interface AvatarUploadProps {
  currentUrl: string | null
  userName: string
  onUpload: (file: File) => Promise<void>
  onError?: (msg: string) => void
}

export function AvatarUpload({ currentUrl, userName, onUpload, onError }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      if (onError) onError('Image must be less than 5MB')
      return
    }
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      await onUpload(selectedFile)
      setPreview(null)
      setSelectedFile(null)
    } catch {
      if (onError) onError('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex items-center gap-5">
      <Avatar src={preview || currentUrl} name={userName} size="lg" />
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleSelect}
          className="hidden"
          id="avatar-input"
        />
        {preview ? (
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 bg-zinc-200 text-zinc-700 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-300 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <label
            htmlFor="avatar-input"
            className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 cursor-pointer transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Change avatar
          </label>
        )}
      </div>
    </div>
  )
}
