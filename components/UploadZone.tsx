'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  Mic, 
  Square, 
  FileText,
  Receipt
} from 'lucide-react';

type UploadZoneProps = {
  onUpload: (file: File | null, text?: string) => void;
  loading?: boolean;
};

// Local type shim for Web Speech API (not in all TS DOM libs)
interface SpeechRecognitionAPI {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
declare const webkitSpeechRecognition: new () => SpeechRecognitionAPI;

export default function UploadZone({ onUpload, loading = false }: UploadZoneProps) {
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startVoice = () => {
    setVoiceError('');
    const SR =
      (window as unknown as Record<string, new () => SpeechRecognitionAPI>)['SpeechRecognition'] ||
      (window as unknown as Record<string, new () => SpeechRecognitionAPI>)['webkitSpeechRecognition'];

    if (!SR) {
      setVoiceError('Voice not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    let finalTranscript = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event: { error: string }) => {
      setVoiceError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        onUpload(null, finalTranscript.trim());
        setTranscript('');
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript('');
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleCameraSnap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
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

  if (isListening || transcript) {
    return (
      <div className="w-full animate-scale-in">
        <div className="glass-strong rounded-3xl p-6 border border-brand-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white font-semibold">Listening...</span>
            <span className="text-white/40 text-xs ml-auto">en-IN</span>
          </div>
          <p className="text-white/70 text-sm min-h-[60px] leading-relaxed">
            {transcript || <span className="text-white/30 italic">Speak now — &quot;I have a DSA exam on Friday...&quot;</span>}
          </p>
          <button
            id="stop-voice-btn"
            onClick={stopVoice}
            className="w-full mt-4 py-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl font-semibold text-sm transition-all hover:bg-red-500/30 flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4 fill-current" />
            Done Speaking → Analyze
          </button>
          {voiceError && <p className="text-red-400 text-xs mt-2 text-center">{voiceError}</p>}
        </div>
      </div>
    );
  }

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
            placeholder={`Paste placement notice, assignment details, or any student information here...\n\nExample: 'TCS NQT Drive — Register by Friday June 7. Eligibility: 60%+, No backlogs. Documents: Resume, ID proof. Venue: Main Auditorium 10 AM'`}
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
    <div className="w-full animate-scale-in space-y-4">
      {/* Hidden camera inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraSnap}
        id="camera-capture-input"
      />
      <input
        ref={receiptInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraSnap}
        id="receipt-capture-input"
      />

      {/* Top row: Snap Notice + Scan Receipt */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="snap-notice-btn"
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="py-4 rounded-2xl font-semibold text-sm transition-all flex flex-col items-center justify-center gap-2 bg-brand-500/10 border-2 border-brand-500/40 text-brand-300 hover:bg-brand-500/20 hover:border-brand-500/70 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Camera className="w-6 h-6" />
          <span>Snap Notice</span>
        </button>
        <button
          id="scan-receipt-btn"
          onClick={() => receiptInputRef.current?.click()}
          disabled={loading}
          className="py-4 rounded-2xl font-semibold text-sm transition-all flex flex-col items-center justify-center gap-2 bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Receipt className="w-6 h-6" />
          <span>Scan Receipt</span>
        </button>
      </div>

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
                or tap to pick from gallery
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
      <div className="flex items-center gap-4">
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

        <button
          id="start-voice-btn"
          onClick={startVoice}
          disabled={loading}
          className="py-4 glass border border-surface-border rounded-2xl text-white/60 hover:text-white hover:border-brand-500/40 font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Mic className="w-4 h-4" />
          <span>Voice</span>
        </button>
      </div>
      {voiceError && <p className="text-red-400 text-xs text-center">{voiceError}</p>}
    </div>
  );
}
