export interface TranscriptionState {
  text: string;
  isTranscribing: boolean;
  progress: string; // 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  error: string | null;
}

export interface AudioFile {
  file: File;
  previewUrl: string;
  duration?: number;
}