'use client';

import { useEffect, useState } from 'react';
import { Clock, User, Award, AlertTriangle, BookOpen } from 'lucide-react';
import { formatMinutes } from '@/lib/utils';

interface ExamHeaderProps {
  examTitle: string;
  studentName: string;
  gradeLevel?: string | null;
  totalQuestions: number;
  answeredCount: number;
  remainingSeconds: number;
  onTimeExpired: () => void;
}

export default function ExamHeader({
  examTitle,
  studentName,
  gradeLevel,
  totalQuestions,
  answeredCount,
  remainingSeconds,
  onTimeExpired,
}: ExamHeaderProps) {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);

  useEffect(() => {
    setTimeLeft(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 300; // less than 5 minutes

  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-3">
        
        {/* Top Info Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Student & Exam Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">{studentName}</span>
                {gradeLevel && (
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {gradeLevel}
                  </span>
                )}
              </div>
              <h1 className="text-xs text-slate-500 font-medium truncate max-w-[240px] sm:max-w-md">
                {examTitle}
              </h1>
            </div>
          </div>

          {/* Countdown Timer Badge */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-sm sm:text-base font-bold shadow-xs transition-colors ${
                isUrgent
                  ? 'bg-rose-50 text-rose-700 border-2 border-rose-300 animate-pulse'
                  : 'bg-slate-900 text-amber-400 border border-slate-800'
              }`}
            >
              {isUrgent ? (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400" />
              )}
              <span dir="ltr">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

        </div>

        {/* Progress Bar & Questions Count */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>
              تمت الإجابة على <strong className="text-slate-900">{answeredCount}</strong> من{' '}
              <strong className="text-slate-900">{totalQuestions}</strong> أسئلة
            </span>
            <span>{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>
    </header>
  );
}
