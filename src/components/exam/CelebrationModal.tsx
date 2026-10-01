'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';

interface CelebrationModalProps {
  isOpen: boolean;
  studentName: string;
  examTitle: string;
  accessCode: string;
  totalScore?: number | null;
  totalMarks?: number;
  hasSubjective?: boolean;
}

export default function CelebrationModal({
  isOpen,
  studentName,
  examTitle,
  accessCode,
  totalScore,
  totalMarks = 10,
  hasSubjective = false,
}: CelebrationModalProps) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-400 scale-100 animate-in zoom-in-95">
        
        {/* Trophy icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/30 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>تم تسليم الإجابات بنجاح!</span>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif-arabic">
          أحسنت يا بطل/ة: {studentName} 🌟
        </h3>

        <p className="text-sm text-slate-600 mb-6">
          لقد أتممت اختبار <strong className="text-slate-800">{examTitle}</strong> بنجاح واجتهاد.
        </p>

        {/* Score or Review Notice */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl p-5 mb-6 text-center">
          {hasSubjective ? (
            <div className="space-y-1">
              <p className="text-amber-900 font-bold text-base">
                جاري مراجعة إجاباتك المقالية من قبل أ/ ضحى مصطفى
              </p>
              <p className="text-xs text-amber-700">
                سيتم إرسال بطاقة النتيجة والدرجة النهائية لوالديك قريباً عبر واتساب.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">الدرجة التلقائية</span>
              <div className="text-3xl font-black text-amber-600 font-serif-arabic">
                {totalScore} <span className="text-base font-normal text-slate-500">/ {totalMarks}</span>
              </div>
            </div>
          )}
        </div>

        {/* Teacher Quote */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic mb-6 leading-relaxed">
          «فخورة جداً بتركيزك واجتهادك في حل الاختبار، استمر دائماً في حب لغتنا العربية الجميلة!»
          <div className="mt-1 font-bold not-italic text-slate-800 font-serif-arabic">
            — معلمتك: أ/ ضحى مصطفى
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/exam/${accessCode}/result`}
          className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-base shadow-md transition-all active:scale-98"
        >
          <span>عرض بطاقة النتيجة والمراجعة</span>
          <ArrowRight className="w-5 h-5 rotate-180" />
        </Link>

      </div>
    </div>
  );
}
