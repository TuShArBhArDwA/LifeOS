'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  Mic, 
  Square, 
  FileText 
} from 'lucide-react';

type UploadZoneProps = {
  onUpload: (file: File | null, text?: string) => void;
  loading?: boolean;
};

export default function UploadZone({ onUpload, loading = false }: UploadZoneProps) {
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-intake.webm', { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        onUpload(audioFile);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);

      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setTimerId(interval);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreview(url);
      }
      onUpload(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    disabled: loading,
  });

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    onUpload(null, textInput);
  };

  if (textMode) {
    return (
      <div className="w-full animate-scale-in">
        <div className="glass-strong rounded-3xl p-6 border border-brand-500/15">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Paste text or notice</h3>
            <button
              id="upload-switch-to-file"
              onClick={() => setTextMode(false)}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              ← Back to upload
            </button>
          </div>
          <textarea
            id="text-input-area"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste placement notice, assignment details, or any student information here...

Example: 'TCS NQT Drive — Register by Friday June 7. Eligibility: 60%+, No backlogs. Documents: Resume, ID proof. Venue: Main Auditorium 10 AM'"
            className="w-full h-44 bg-surface-elevated border border-surface-border rounded-2xl px-4 py-3 text-white placeholder-white/25 focus:border-brand-500 focus:outline-none transition-colors text-sm resize-none"
          />
          <button
            id="text-submit-btn"
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || loading}
            className="w-full mt-4 py-4 bg-gradient-brand text-white rounded-2xl font-semibold transition-all hover:opacity-90 hover:shadow-brand disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Analyze with LifeOS →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-scale-in">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        id="file-dropzone"
        className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-brand-500 bg-brand-500/10 scale-[1.02]'
            : 'border-surface-border hover:border-brand-500/50 hover:bg-brand-500/5'
        } ${loading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} id="file-input" />

        {preview ? (
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-2xl object-contain" />
            <p className="text-sm text-brand-400 font-medium">
              {loading ? 'Analyzing with LifeOS...' : 'Image ready — tap again to change'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Icon */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface-elevated border border-surface-border mx-auto">
              {isDragActive ? (
                <Sparkles className="w-8 h-8 text-brand-400" />
              ) : (
                <UploadCloud className="w-8 h-8 text-white/40" />
              )}
              {isDragActive && (
                <div className="absolute inset-0 rounded-3xl border-2 border-brand-500 animate-pulse" />
              )}
            </div>

            <div>
              <p className="text-white font-semibold text-lg">
                {isDragActive ? 'Drop it here!' : 'Drop screenshot or PDF'}
              </p>
              <p className="text-white/40 text-sm mt-1">
                or tap to take a photo / pick from gallery
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 text-xs text-white/25">
              <span className="px-2 py-1 bg-surface-elevated rounded-md">PNG</span>
              <span className="px-2 py-1 bg-surface-elevated rounded-md">JPG</span>
              <span className="px-2 py-1 bg-surface-elevated rounded-md">WEBP</span>
              <span className="px-2 py-1 bg-surface-elevated rounded-md">PDF</span>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-4">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-xs text-white/30">or</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      {/* Mode selectors */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="switch-to-text-btn"
          onClick={() => setTextMode(true)}
          className="py-4 glass border border-surface-border rounded-2xl text-white/60 hover:text-white hover:border-brand-500/40 font-medium text-sm transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Paste text</span>
        </button>

        {isRecording ? (
          <button
            id="stop-voice-btn"
            onClick={stopRecording}
            className="py-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-semibold text-sm transition-all flex items-center justify-center gap-2 animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop ({recordingDuration}s)</span>
          </button>
        ) : (
          <button
            id="start-voice-btn"
            onClick={startRecording}
            className="py-4 glass border border-surface-border rounded-2xl text-white/60 hover:text-white hover:border-brand-500/40 font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4" />
            <span>Record voice</span>
          </button>
        )}
      </div>
    </div>
  );
}
