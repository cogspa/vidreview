import React, { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VideoFile } from "@/types"

interface VideoUploaderProps {
  onUpload: (file: VideoFile) => void;
}

export function VideoUploader({ onUpload }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      console.log('Upload successful:', data)
      onUpload({
        url: `${import.meta.env.VITE_API_URL}/${data.path}`,
        filename: data.filename
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <label htmlFor="video-upload" className="w-full">
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary">
              <Upload className="mx-auto mb-4" size={32} />
              <p className="text-lg font-medium">Upload Video</p>
              <p className="text-sm text-muted-foreground">
                Click to select or drag and drop your video file
              </p>
            </div>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {uploading && (
            <Button disabled>
              Uploading...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
