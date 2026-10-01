'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  Volume2, 
  CheckCircle, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Users, 
  MessageSquareQuote,
  LayoutDashboard
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEnterExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setErrorMsg('يُرجى إدخال رمز الوصول (PIN) المكون من 6 إلى 8 أحرف');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    router.push(`/exam/${accessCode.trim().toLowerCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-amber-200/50">
          
          {/* Subtle Background Geometry */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute -top-24 right-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-10 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              
              {/* Luxury Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-amber-500/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-semibold text-amber-400 font-serif-arabic">
                  المنصة التفاعلية المعتمدة للأستاذة ضُحَىٰ مُصْطَفَى
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 font-serif-arabic leading-tight sm:leading-tight">
                تأسيس وتقييم متميز في{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 underline decoration-amber-300 decoration-wavy decoration-2">
                  اللغة العربية
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                منصة رقمية رائدة لطلاب المرحلة الابتدائية، تجمع بين التدريبات النحوية، الإملاء الصوتي التفاعلي، القراءة المتحررة، والتصحيح الدقيق المدعوم بلوحة تشكيل كاملة.
              </p>

              {/* Student Exam Access Form */}
              <div id="exam-entry" className="pt-6 max-w-md mx-auto">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-300/80 relative">
                  <div className="absolute -top-3 right-6 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    دخول الطلاب
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-arabic">
                    هل لديك رمز اختبار؟
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    أدخل الرمز الذي استلمته من المعلمة عبر واتساب لبدء الاختبار مباشرة
                  </p>

                  <form onSubmit={handleEnterExam} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        placeholder="مثال: doha4a"
                        dir="ltr"
                        className="w-full text-center px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 text-slate-900 text-xl font-mono uppercase tracking-widest font-bold outline-none transition-all"
                      />
                      {errorMsg && (
                        <p className="text-xs text-rose-600 mt-2 font-semibold">{errorMsg}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 group active:scale-98"
                    >
                      <span>{isLoading ? 'جاري التحقق...' : 'ابدأ الاختبار الآن'}</span>
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Pillars Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                أحدث تقنيات التعليم التفاعلي
              </span>
              <h2 className="text-3xl font-black text-slate-900 font-serif-arabic">
                كل ما يحتاجه طالب الابتدائي للتفوق
              </h2>
              <p className="text-sm text-slate-600">
                صممت المنصة بعناية لتناسب قدرات الأطفال وتوفر تجربة تعليمية ممتعة وسهلة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-amber-200/70 hover:border-amber-400 hover:shadow-lg transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">مشغل الإملاء الصوتي</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  استماع نقي للقطعة الإملائية بصوت المعلمة مع تحكم في السرعة وعدد مرات إعادة محددة لتدريب الطالب.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-amber-200/70 hover:border-amber-400 hover:shadow-lg transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">لوحة التشكيل السريع</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  أزرار لمس مخصصة لجميع حركات التشكيل والتنوين والشدة تمكن الطالب من ضبط الكلمات بسهولة تامة.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-amber-200/70 hover:border-amber-400 hover:shadow-lg transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">بيئة اختبار آمنة</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  رابط مخصص لكل طالب، توقيت تلقائي، حفظ مستمر للإجابات، وتنبيه فوري عند مغادرة نافذة الامتحان.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-amber-200/70 hover:border-amber-400 hover:shadow-lg transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">تقارير وشهادات واتساب</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  إرسال بطاقات الدرجات وملاحظات المعلمة بنقرة واحدة لأولياء الأمور لمتابعة مستوى أبنائهم.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Teacher Profile & Quote */}
        <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-800/90 rounded-3xl p-8 sm:p-12 border border-slate-700 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
              
              <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg shrink-0">
                <span className="font-serif-arabic text-amber-400 text-4xl font-bold">ض</span>
              </div>

              <div className="space-y-3 text-center md:text-right">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/30">
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>معلمة اللغة العربية والتأسيس المتميز</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif-arabic text-white">
                  أ/ ضُحَىٰ مُصْطَفَى
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-serif-arabic">
                  «حرصتُ على بناء هذه المنصة لنوفر لأبنائنا وبناتنا تجربة تقييم محفزة تنمي ثقتهم بأنفسهم وتجعل تعلم قواعد لغتنا الخالدة وإملائها ممتعاً وسهلاً.»
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
