export interface VideoSection {
  startTime: number;
  endTime: number;
  title: string;
  transcript: string;
}

export interface VideoFile {
  url: string;
  filename: string;
}
