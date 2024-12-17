import { useState } from 'react'
import { VideoUploader } from './components/VideoUploader'
import { VideoPlayer } from './components/VideoPlayer'
import { VideoSection, VideoFile } from './types'

function App() {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [sections, setSections] = useState<VideoSection[]>([]);

  const handleVideoUpload = (file: VideoFile) => {
    setVideoFile(file);
    setSections([]);
  };

  const handleAddSection = (section: VideoSection) => {
    setSections([...sections, section]);
  };

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Video Processor</h1>
      <VideoUploader onUpload={handleVideoUpload} />
      {videoFile && (
        <div className="mt-8">
          <VideoPlayer
            videoUrl={videoFile.url}
            onAddSection={handleAddSection}
          />
          <div className="mt-4 space-y-2">
            {sections.map((section, index) => (
              <div key={index} className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold">{section.title}</h3>
                <p className="text-sm text-gray-600">
                  {Math.floor(section.startTime)}s - {Math.floor(section.endTime)}s
                </p>
                {section.transcript && (
                  <p className="mt-2 text-sm">{section.transcript}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

export default App
