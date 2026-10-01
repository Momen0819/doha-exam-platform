'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Share2, 
  ArrowLeft, 
  Sparkles,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { generateResultWhatsAppUrl } from '@/lib/whatsapp';

export default function ExamResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/exam/${code}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'تعذر تحميل النتيجة');
          setLoading(false);
          return;
        }
        const linkData = data.examLink || data.data;
        setResultData(linkData);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('تعذر الاتصال بالخادم');
        setLoading(false);
      }
    }

    loadResult();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto animate-spin">
            <span className="font-serif-arabic text-amber-700 text-2xl font-bold">ض</span>
          </div>
          <p className="text-base font-bold text-slate-800">جاري استخراج بطاقة الدرجات والتقرير...</p>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border-2 border-rose-300 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 font-serif-arabic">عذراً</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <Link
            href="/"
            className="block w-full py-3 px-4 rounded-xl bg-slate-900 text-amber-400 font-bold text-sm"
          >
            الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const { student, exam, attempt, status } = resultData;
  const isGraded = status === 'GRADED' || (attempt && attempt.totalScore !== null);
  const totalScore = attempt?.totalScore ?? 0;
  const totalMarks = exam?.totalMarks ?? 100;
  const scorePercent = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

  const getAppreciation = (percent: number) => {
    if (percent >= 90) return { title: 'ممتاز جداً مع مرتبة الشرف 🌟', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (percent >= 80) return { title: 'جيد جداً مرتفع 👏', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (percent >= 65) return { title: 'جيد وبداية موفقة 👍', color: 'text-amber-800 bg-amber-50 border-amber-300' };
    return { title: 'يحتاج لمزيد من المراجعة والتأسيس 💪', color: 'text-rose-800 bg-rose-50 border-rose-300' };
  };

  const appreciation = getAppreciation(scorePercent);

  // WhatsApp share link for parent
  const parentPhone = student.parentPhone || '';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const whatsAppUrl = generateResultWhatsAppUrl(
    parentPhone,
    student.name,
    exam.title,
    totalScore,
    totalMarks,
    appreciation.title,
    attempt?.feedback,
    currentOrigin
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* Main Certificate Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-xl space-y-8 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-amber-400 via-amber-600 to-yellow-500" />

          {/* Top Title */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>بطاقة تقييم ونتائج معتمدة</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-arabic">
              {exam.title}
            </h1>
            <p className="text-base text-slate-700">
              اسم الطالب/ـة: <strong className="text-slate-900 text-lg font-bold">{student.name}</strong>
              {student.gradeLevel && (
                <span className="mr-2 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                  {student.gradeLevel}
                </span>
              )}
            </p>
          </div>

          {/* Score Circle & Rating */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-right">
            
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-slate-900 text-white flex flex-col items-center justify-center border-4 border-amber-400 shadow-lg">
                <span className="text-3xl font-black font-mono text-amber-400 leading-none">
                  {totalScore}
                </span>
                <span className="text-xs text-slate-300 font-semibold mt-1">من {totalMarks}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 mt-2">الدرجة النهائية ({scorePercent}%)</span>
            </div>

            <div className="space-y-2 max-w-sm">
              <div className={`inline-block text-sm sm:text-base font-bold px-4 py-1.5 rounded-full border ${appreciation.color}`}>
                {appreciation.title}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {attempt?.feedback ||
                  'بارك الله فيك يا بطل! استمر في القراءة والممارسة لتظل دائماً في مقدمة المتميزين.'}
              </p>
            </div>

          </div>

          {/* WhatsApp Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md transition-all active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>مشاركة النتيجة مع ولي الأمر عبر واتساب</span>
            </a>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-all"
            >
              <span>العودة للرئيسية</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
