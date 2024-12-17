import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { VideoSection } from '@/types';
import { Pause, Play, Plus, Type } from 'lucide-react';
import axios from 'axios';

interface VideoPlayerProps {
  videoUrl: string;
  onAddSection: (section: VideoSection) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onAddSection }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionStart, setSectionStart] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const startSection = () => {
    if (videoRef.current) {
      setSectionStart(videoRef.current.currentTime);
    }
  };

  const transcribeSection = async (section: VideoSection): Promise<string> => {
    try {
      setIsTranscribing(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/transcribe`, {
        video_path: videoUrl,  // Send the full URL path
        start_time: section.startTime,
        end_time: section.endTime
      });
      return response.data.text;
    } catch (error) {
      console.error('Transcription failed:', error);
      return '';
    } finally {
      setIsTranscribing(false);
    }
  };

  const endSection = async () => {
    if (videoRef.current && sectionStart !== null) {
      const newSection: VideoSection = {
        startTime: sectionStart,
        endTime: videoRef.current.currentTime,
        title: sectionTitle || `Section ${Math.floor(sectionStart)}s - ${Math.floor(videoRef.current.currentTime)}s`,
        transcript: ''
      };

      const transcript = await transcribeSection(newSection);
      newSection.transcript = transcript;
      onAddSection(newSection);

      setSectionStart(null);
      setSectionTitle('');
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 space-y-4">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full rounded-lg"
        onTimeUpdate={handleTimeUpdate}
        controls={false}
      />

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <span className="text-sm">{formatTime(currentTime)}</span>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Section title"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          disabled={sectionStart === null || isTranscribing}
        />
        <Button
          variant="outline"
          onClick={sectionStart === null ? startSection : endSection}
          disabled={isTranscribing}
        >
          {isTranscribing ? (
            <>
              <Type className="h-4 w-4 mr-2 animate-spin" />
              Transcribing...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {sectionStart === null ? 'Start Section' : 'End Section'}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
