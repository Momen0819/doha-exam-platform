import Link from 'next/link';
import { Heart, Sparkles, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <span className="font-serif-arabic text-amber-400 text-xl font-bold">ض</span>
              </div>
              <span className="font-serif-arabic text-lg font-bold text-white">
                أ/ ضُحَىٰ مُصْطَفَى
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              منصة تعليمية متطورة لتأسيس وتقييم طلاب المرحلة الابتدائية في اللغة العربية، القواعد النحوية، مهارات الإملاء، والقراءة المتحررة.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">الصفحة الرئيسية</Link>
              </li>
              <li>
                <Link href="/#exam-entry" className="hover:text-amber-400 transition-colors">دخول اختبار بـ PIN</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">لوحة المعلمة</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Teacher Note */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">رسالة المعلمة</h4>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-amber-200/90 leading-relaxed font-serif-arabic text-base">
              «لغتنا العربية بحر من الجمال والبيان، وهدفنا أن يتقن أطفالنا نطقها وكتابتها بكل حب واعتزاز.»
            </div>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} منصة أ/ ضحى مصطفى لاختبارات اللغة العربية. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-1">
            <span>صُممت بكل</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>لأبطال العربية</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
