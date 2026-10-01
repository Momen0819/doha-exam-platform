'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw, AlertCircle } from 'lucide-react';

interface AudioDictationPlayerProps {
  audioUrl?: string | null;
  maxPlays?: number;
  currentPlays?: number;
  onPlayIncrement?: () => void;
  promptText?: string;
}

export default function AudioDictationPlayer({
  audioUrl = '/audio/sample-dictation.mp3',
  maxPlays = 3,
  currentPlays = 0,
  onPlayIncrement,
  promptText,
}: AudioDictationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(currentPlays);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setPlayCount(currentPlays);
  }, [currentPlays]);

  const remainingPlays = Math.max(0, maxPlays - playCount);

  const handlePlayToggle = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    if (remainingPlays <= 0) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl || '/audio/sample-dictation.mp3');
      audioRef.current.playbackRate = playbackRate;

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setProgress(100);
      };

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };

      audioRef.current.onerror = () => {
        // Fallback: Web Speech API synthesis if audio file not supported/found
        if ('speechSynthesis' in window && promptText) {
          const utterance = new SpeechSynthesisUtterance(promptText);
          utterance.lang = 'ar-SA';
          utterance.rate = playbackRate;
          utterance.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlaying(false);
        }
      };
    }

    audioRef.current.playbackRate = playbackRate;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      const newCount = playCount + 1;
      setPlayCount(newCount);
      if (onPlayIncrement) onPlayIncrement();
    }).catch((e) => {
      console.warn('Audio play failed, fallback synthesis:', e);
      if ('speechSynthesis' in window && promptText) {
        const utterance = new SpeechSynthesisUtterance(promptText);
        utterance.lang = 'ar-SA';
        utterance.rate = playbackRate;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        const newCount = playCount + 1;
        setPlayCount(newCount);
        if (onPlayIncrement) onPlayIncrement();
      }
    });
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">استمع إلى القطعة الإملائية</h4>
            <p className="text-xs text-slate-600">اضغط على زر التشغيل واستمع بتركيز ثم اكتب في خانة الإجابة أدناه</p>
          </div>
        </div>

        {/* Plays Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              remainingPlays > 1
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : remainingPlays === 1
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {remainingPlays > 0 ? (
              <>
                <RotateCcw className="w-3 h-3" />
                <span>متبقي {remainingPlays} {remainingPlays === 1 ? 'محاولة استماع' : 'محاولات استماع'}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>انتهت محاولات الاستماع</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Player Bar */}
      <div className="bg-white rounded-xl p-4 border border-amber-200/70 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        
        {/* Big Play Button */}
        <button
          type="button"
          onClick={handlePlayToggle}
          disabled={remainingPlays <= 0 && !isPlaying}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
            remainingPlays <= 0 && !isPlaying
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : isPlaying
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-amber-600 hover:bg-amber-700 active:scale-95 text-white'
          }`}
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الصوت'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white mr-0.5" />}
        </button>

        {/* Waveform / Progress bar */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{isPlaying ? 'جاري الاستماع...' : 'جاهز للاستماع'}</span>
            <span>السرعة: {playbackRate}x</span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <button
            type="button"
            onClick={() => handleRateChange(0.8)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              playbackRate === 0.8
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            بطيء (0.8x)
          </button>
          <button
            type="button"
            onClick={() => handleRateChange(1.0)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              playbackRate === 1.0
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            عادي (1.0x)
          </button>
        </div>

      </div>
    </div>
  );
}
