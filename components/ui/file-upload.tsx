
'use client'

import { useCallback, useState } from 'react'
import { Upload, X, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  onRemove?: () => void
  accept?: string
  maxSize?: number
  value?: string
  className?: string
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = 'image/*,video/*,.pdf,.doc,.docx',
  maxSize = 10 * 1024 * 1024, // 10MB
  value,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      setError(null)

      const files = Array.from(e.dataTransfer.files)
      if (files.length === 0) return

      const file = files[0]

      if (file.size > maxSize) {
        setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
        return
      }

      setUploading(true)
      try {
        await onUpload(file)
      } catch (err) {
        setError('Failed to upload file')
        console.error('Upload error:', err)
      } finally {
        setUploading(false)
      }
    },
    [onUpload, maxSize]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      const files = e.target.files
      if (!files || files.length === 0) return

      const file = files[0]

      if (file.size > maxSize) {
        setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
        return
      }

      setUploading(true)
      try {
        await onUpload(file)
      } catch (err) {
        setError('Failed to upload file')
        console.error('Upload error:', err)
      } finally {
        setUploading(false)
      }
    },
    [onUpload, maxSize]
  )

  if (value) {
    return (
      <div className={cn('relative', className)}>
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2">
            <File className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">File uploaded</span>
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400',
          uploading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          {uploading ? (
            <p className="text-sm text-gray-600">Uploading...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                Max file size: {maxSize / (1024 * 1024)}MB
              </p>
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
