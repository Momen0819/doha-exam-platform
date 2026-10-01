'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Award, CheckCircle, Clock, Search, ExternalLink, Save, MessageCircle, ArrowRight } from 'lucide-react';
import { generateResultWhatsAppUrl } from '@/lib/whatsapp';

export default function GradingQueuePage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const [itemGrades, setItemGrades] = useState<{ [itemId: string]: number }>({});
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success && data.data?.recentAttempts) {
        setAttempts(data.data.recentAttempts);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, []);

  const openGradingModal = async (att: any) => {
    try {
      const res = await fetch(`/api/grading/${att.id}`);
      const data = await res.json();
      if (data.success && data.attempt) {
        setSelectedAttempt(data.attempt);
        setTeacherFeedback(data.attempt.teacherFeedback || '');
        const initialScores: { [key: string]: number } = {};
        data.attempt.answers?.forEach((ans: any) => {
          initialScores[ans.questionId] = ans.scoreAwarded || 0;
        });
        setItemGrades(initialScores);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGrading = async () => {
    if (!selectedAttempt) return;

    try {
      setSavingGrade(true);
      const questionScores: Record<string, { score: number; note?: string }> = {};
      Object.keys(itemGrades).forEach((qId) => {
        questionScores[qId] = {
          score: Number(itemGrades[qId]) || 0,
        };
      });

      const res = await fetch(`/api/grading/${selectedAttempt.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherFeedback,
          publishFeedback: true,
          questionScores,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedAttempt(null);
        loadAttempts();
      } else {
        alert(data.error || 'تعذر حفظ الدرجات');
      }
      setSavingGrade(false);
    } catch (e) {
      console.error(e);
      setSavingGrade(false);
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-arabic">
            غرفة التصحيح والمراجعة اليدوية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            مراجعة إجابات الطلاب للأسئلة المقالية والإعراب ورصد الدرجات النهائية
          </p>
        </div>

        {/* Attempts Table / List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto animate-spin mb-3">
              <span className="font-serif-arabic text-amber-700 text-xl font-bold">ض</span>
            </div>
            <p className="text-sm text-slate-500">جاري تحميل سجل التسليمات...</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-4 max-w-lg mx-auto">
            <Award className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">لا توجد تسليمات للاختبارات بعد</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attempts.map((att) => {
              const studentName = att.examLink?.student?.name || 'طالب';
              const examTitle = att.examLink?.exam?.title || 'اختبار';
              const totalMarks = att.examLink?.exam?.totalMarks || 100;
              const isGraded = att.isGraded;
              const parentPhone = att.examLink?.student?.parentPhone || '';
              const waUrl = generateResultWhatsAppUrl(
                parentPhone,
                studentName,
                examTitle,
                att.totalScore,
                totalMarks,
                att.examLink?.accessCode || '',
                origin
              );

              return (
                <div
                  key={att.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isGraded
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isGraded ? 'تم الاعتماد' : 'يحتاج مراجعة المعلمة'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {new Date(att.submittedAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">{studentName}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{examTitle}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">الدرجة المرصودة:</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {att.totalScore} / {totalMarks}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openGradingModal(att)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      <span>{isGraded ? 'تعديل الدرجات' : 'بدء التصحيح'}</span>
                    </button>

                    {parentPhone && isGraded && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-200"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>إرسال الشهادة للوالد</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Grading Review Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">
                  تصحيح ورقة إجابة: {selectedAttempt.examLink?.student?.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedAttempt.examLink?.exam?.title}</p>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            {/* Questions Grading Items */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto p-1">
              {selectedAttempt.examLink?.exam?.questions?.map((q: any, idx: number) => {
                const ans = selectedAttempt.answers?.find((a: any) => a.questionId === q.id);
                return (
                  <div
                    key={q.id}
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">سؤال {idx + 1} ({q.type})</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">من {q.marks || 0} درجات:</span>
                        <input
                          type="number"
                          min="0"
                          max={q.marks || 10}
                          value={itemGrades[q.id] ?? 0}
                          onChange={(e) =>
                            setItemGrades({
                              ...itemGrades,
                              [q.id]: Number(e.target.value),
                            })
                          }
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <p className="text-xs font-bold text-slate-900">{q.promptText || q.prompt}</p>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="text-slate-500">إجابة الطالب:</div>
                      <div className="font-bold text-slate-800 font-serif-arabic">
                        {ans?.studentAnswer || <span className="text-slate-400 font-sans">لم يُجب</span>}
                      </div>
                    </div>

                    {q.correctAnswer && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg">
                        <strong>الإجابة النموذجية:</strong> {q.correctAnswer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Teacher Feedback textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                ملاحظات المعلمة وكلمة التشجيع للطالب 🌟
              </label>
              <textarea
                rows={2}
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder="أحسنت يا بطل! تدرب أكثر على التمييز بين همزة الوصل والقطع..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-amber-500 font-serif-arabic"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAttempt(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveGrading}
                disabled={savingGrade}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingGrade ? 'جاري الاعتماد...' : 'اعتماد الدرجة النهائية'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
