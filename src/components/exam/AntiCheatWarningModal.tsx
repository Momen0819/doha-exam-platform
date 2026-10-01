'use client';

import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface AntiCheatWarningModalProps {
  isOpen: boolean;
  switchCount: number;
  onClose: () => void;
}

export default function AntiCheatWarningModal({
  isOpen,
  switchCount,
  onClose,
}: AntiCheatWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border-2 border-rose-500/30 scale-100 animate-in zoom-in-95">
        
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          تنبيه: مغادرة صفحة الامتحان!
        </h3>

        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          لقد قمت بالخروج من شاشة الامتحان أو التبديل لنافذة أخرى. يُرجى البقاء في هذه الصفحة للتركيز وضمان تسجيل إجاباتك بنجاح.
        </p>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-6 flex items-center justify-center gap-2 text-xs font-semibold text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>عدد مرات الخروج المسجلة: {switchCount}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-sm shadow-md transition-all active:scale-98"
        >
          أنا منتبه وسأكمل الامتحان
        </button>

      </div>
    </div>
  );
}
