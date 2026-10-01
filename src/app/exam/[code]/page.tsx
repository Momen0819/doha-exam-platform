'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ExamHeader from '@/components/exam/ExamHeader';
import QuestionCard from '@/components/exam/QuestionCard';
import AntiCheatWarningModal from '@/components/exam/AntiCheatWarningModal';
import CelebrationModal from '@/components/exam/CelebrationModal';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ShieldAlert, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface Question {
  id: string;
  type: any;
  prompt: string;
  passage?: string | null;
  audioUrl?: string | null;
  maxAudioPlays: number;
  options?: any;
  marks: number;
  orderNum: number;
}

interface ExamData {
  id: string;
  title: string;
  description?: string | null;
  durationMins: number;
  totalMarks: number;
  gradeLevel?: string | null;
  questions: Question[];
}

interface LinkData {
  id: string;
  accessCode: string;
  status: string;
  startedAt?: string | null;
  submittedAt?: string | null;
  student: {
    name: string;
    gradeLevel?: string | null;
  };
  exam: ExamData;
}

export default function StudentExamPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkData, setLinkData] = useState<LinkData | null>(null);

  // Exam taking state
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [audioPlays, setAudioPlays] = useState<Record<string, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  
  // Anti-cheat state
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false);

  // Submission / Celebration state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    totalScore?: number | null;
    totalMarks?: number;
    hasSubjective?: boolean;
  } | null>(null);

  // 1. Fetch Exam details
  const fetchExam = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/exam/${code}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'رمز الوصول غير صالح أو منتهي');
        setLoading(false);
        return;
      }

      setLinkData(data.data);

      // If already submitted or graded, redirect to result
      if (data.data.status === 'SUBMITTED' || data.data.status === 'GRADED') {
        router.push(`/exam/${code}/result`);
        return;
      }

      // If already started in progress
      if (data.data.startedAt && data.remainingSeconds !== undefined) {
        setIsStarted(true);
        setRemainingSeconds(data.remainingSeconds);
      } else {
        setRemainingSeconds(data.data.exam.durationMins * 60);
      }

      // Restore any draft answers
      if (data.draftAnswers) {
        setAnswers(data.draftAnswers);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('تعذر الاتصال بالخادم');
      setLoading(false);
    }
  }, [code, router]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  // 2. Anti-cheat tab switch detection
  useEffect(() => {
    if (!isStarted || showCelebration) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          setShowCheatModal(true);
          return nextCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStarted, showCelebration]);

  // 3. Draft auto-save
  useEffect(() => {
    if (!isStarted || showCelebration || Object.keys(answers).length === 0) return;

    const interval = setInterval(() => {
      fetch(`/api/exam/${code}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftAnswers: answers }),
      }).catch((e) => console.warn('Draft save failed:', e));
    }, 15000);

    return () => clearInterval(interval);
  }, [isStarted, showCelebration, answers, code]);

  // Start exam handler
  const handleStartExam = async () => {
    try {
      const res = await fetch(`/api/exam/${code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceFingerprint: navigator.userAgent }),
      });
      const data = await res.json();
      if (data.success) {
        setIsStarted(true);
        if (data.remainingSeconds) {
          setRemainingSeconds(data.remainingSeconds);
        }
      }
    } catch (e) {
      console.error('Failed to start exam:', e);
    }
  };

  // Answer change handler
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Audio play increment
  const handleAudioPlayIncrement = (questionId: string) => {
    setAudioPlays((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1,
    }));
  };

  // Submit exam handler
  const handleSubmitExam = async () => {
    if (!linkData) return;

    const unansweredCount = linkData.exam.questions.filter((q) => !answers[q.id]?.trim()).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `لديك ${unansweredCount} أسئلة لم تقم بالإجابة عليها بعد. هل أنت متأكد من رغبتك في تسليم الامتحان الآن؟`
      );
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/exam/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          tabSwitches: tabSwitchCount,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSubmissionResult({
          totalScore: data.totalScore,
          totalMarks: data.totalMarks,
          hasSubjective: data.hasSubjective,
        });
        setShowCelebration(true);
      } else {
        alert(data.error || 'تعذر تسليم الاختبار');
      }
      setIsSubmitting(false);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تسليم الاختبار');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto animate-spin">
            <span className="font-serif-arabic text-amber-700 text-2xl font-bold">ض</span>
          </div>
          <p className="text-base font-bold text-slate-800">جاري تحميل الاختبار وتجهيز الأسئلة...</p>
        </div>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border-2 border-rose-300 space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif-arabic">عذراً! تعذر فتح الاختبار</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 text-amber-400 font-bold text-sm"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  const { exam, student } = linkData;
  const questions = exam.questions;
  const currentQuestion = questions[currentIndex];
  const answeredQuestionsCount = questions.filter((q) => answers[q.id]?.trim()).length;

  // Instructions screen before starting
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-xl border-2 border-amber-300/80 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-md">
              <span className="font-serif-arabic text-amber-400 text-3xl font-bold">ض</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>منصة أ/ ضحى مصطفى للغة العربية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-arabic">
              {exam.title}
            </h1>
            <p className="text-sm text-slate-600">
              مرحباً بك يا بطل/ة:{' '}
              <strong className="text-slate-900 font-bold text-base">{student.name}</strong>
              {student.gradeLevel && (
                <span className="mr-2 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  ({student.gradeLevel})
                </span>
              )}
            </p>
          </div>

          {/* Exam Specs Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1">
              <Clock className="w-5 h-5 text-amber-600 mx-auto" />
              <div className="text-xs text-slate-500">زمن الاختبار</div>
              <div className="text-sm font-bold text-slate-900">{exam.durationMins} دقيقة</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1">
              <BookOpen className="w-5 h-5 text-blue-600 mx-auto" />
              <div className="text-xs text-slate-500">عدد الأسئلة</div>
              <div className="text-sm font-bold text-slate-900">{questions.length} أسئلة</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1">
              <Sparkles className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="text-xs text-slate-500">الدرجة الكلية</div>
              <div className="text-sm font-bold text-slate-900">{exam.totalMarks} درجات</div>
            </div>
          </div>

          {/* Instructions List */}
          <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-5 space-y-2.5">
            <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>تعليمات هامة قبل البدء:</span>
            </h3>
            <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
              <li>اقرأ كل سؤال بتمهل وتركيز قبل اختيار الإجابة أو كتابتها.</li>
              <li>يمكنك استخدام لوحة التشكيل السريع المرفقة مع كل سؤال كتابي لوضع الحركات والتنوين.</li>
              <li>في سؤال الإملاء، يمكنك الاستماع إلى التسجيل الصوتي بحد أقصى 3 مرات.</li>
              <li>لا تقم بإغلاق الصفحة أو التنقل بين التطبيقات لضمان استمرار الاختبار بأمان.</li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartExam}
            className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 active:scale-98"
          >
            <Play className="w-6 h-6 fill-amber-400" />
            <span>بسم الله.. ابدأ الاختبار الآن</span>
          </button>

        </div>
      </div>
    );
  }

  // Active Exam Taking Screen
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] pb-24">
      {/* Sticky Header with Timer & Progress */}
      <ExamHeader
        examTitle={exam.title}
        studentName={student.name}
        gradeLevel={student.gradeLevel}
        totalQuestions={questions.length}
        answeredCount={answeredQuestionsCount}
        remainingSeconds={remainingSeconds}
        onTimeExpired={handleSubmitExam}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Active Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            currentAnswer={answers[currentQuestion.id] || ''}
            audioPlaysCount={audioPlays[currentQuestion.id] || 0}
            onAnswerChange={(val) => handleAnswerChange(currentQuestion.id, val)}
            onAudioPlayIncrement={() => handleAudioPlayIncrement(currentQuestion.id)}
          />
        )}

        {/* Navigation & Question Jump Pills */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          
          {/* Question Grid Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>انتقل لأي سؤال مباشرة:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> مجاب
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" /> متبقي
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]?.trim());
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      isCurrent
                        ? 'bg-slate-900 text-amber-400 ring-2 ring-amber-400 shadow-md scale-105'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Prev / Next / Submit Action Bar */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                currentIndex === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
              <span>السابق</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-sm shadow-md transition-all active:scale-98"
              >
                <span>التالي</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg transition-all active:scale-98 animate-pulse"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'جاري التسليم...' : 'تسليم الامتحان'}</span>
              </button>
            )}

          </div>

        </div>

      </main>

      {/* Anti-cheat tab switch warning modal */}
      <AntiCheatWarningModal
        isOpen={showCheatModal}
        switchCount={tabSwitchCount}
        onClose={() => setShowCheatModal(false)}
      />

      {/* Celebration Modal on Submit */}
      <CelebrationModal
        isOpen={showCelebration}
        studentName={student.name}
        examTitle={exam.title}
        accessCode={code}
        totalScore={submissionResult?.totalScore}
        totalMarks={submissionResult?.totalMarks}
        hasSubjective={submissionResult?.hasSubjective}
      />
    </div>
  );
}
