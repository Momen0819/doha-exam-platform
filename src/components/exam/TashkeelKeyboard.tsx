'use client';

import { TASHKEEL_BUTTONS } from '@/lib/arabic-helpers';
import { Sparkles } from 'lucide-react';

interface TashkeelKeyboardProps {
  onInsert: (char: string) => void;
  className?: string;
}

export default function TashkeelKeyboard({ onInsert, className = '' }: TashkeelKeyboardProps) {
  return (
    <div className={`bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 shadow-xs ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>لوحة التشكيل السريع (اضغط لإضافة الحركة):</span>
        </div>
        <span className="text-[11px] text-amber-700/80 hidden sm:inline">اضغط على الحركة لتوضع على آخر حرف</span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
        {TASHKEEL_BUTTONS.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onInsert(t.char);
            }}
            title={`${t.name} (مثال: ${t.example})`}
            className="tashkeel-btn flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white border border-amber-300/80 hover:bg-amber-500 hover:text-white hover:border-amber-600 text-slate-800 shadow-xs hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <span className="text-xl sm:text-2xl font-bold font-serif-arabic leading-none mb-1">
              {t.label}
            </span>
            <span className="text-[10px] text-slate-500 hover:text-white leading-tight font-medium truncate max-w-full">
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
