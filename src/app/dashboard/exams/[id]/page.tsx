'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageCircle, 
  Users, 
  Volume2, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Award,
  X,
  Share2
} from 'lucide-react';
import { generateExamLinkWhatsAppUrl } from '@/lib/whatsapp';

export default function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;

  const [exam, setExam] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Question modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [qType, setQType] = useState('MCQ');
  const [qPrompt, setQPrompt] = useState('');
  const [qPassage, setQPassage] = useState('');
  const [qAudioUrl, setQAudioUrl] = useState('');
  const [qMarks, setQMarks] = useState(2);
  const [qCorrectAnswer, setQCorrectAnswer] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Link generator modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  const loadExamAndStudents = async () => {
    try {
      setLoading(true);
      const [resExam, resStudents] = await Promise.all([
        fetch(`/api/exams/${examId}`),
        fetch('/api/students'),
      ]);

      const [dataExam, dataStudents] = await Promise.all([
        resExam.json(),
        resStudents.json(),
      ]);

      if (dataExam.success) setExam(dataExam.data);
      if (dataStudents.success) setStudents(dataStudents.data);

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamAndStudents();
  }, [examId]);

  const handleCopy = (code: string) => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(`${origin}/exam/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qPrompt.trim()) return;

    try {
      setSavingQuestion(true);
      const filteredOptions = qOptions.filter((o) => o.trim());

      const payload = {
        type: qType,
        prompt: qPrompt.trim(),
        passage: qPassage.trim() || null,
        audioUrl: qAudioUrl.trim() || null,
        marks: Number(qMarks),
        correctAnswer: qCorrectAnswer.trim() || null,
        options: filteredOptions.length > 0 ? filteredOptions : null,
        orderNum: (exam?.questions?.length || 0) + 1,
      };

      const updatedQuestions = [...(exam?.questions || []), payload];

      const res = await fetch(`/api/exams/${examId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: exam.title,
          description: exam.description,
          durationMins: exam.durationMins,
          totalMarks: exam.totalMarks,
          gradeLevel: exam.gradeLevel,
          questions: updatedQuestions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowQuestionModal(false);
        setQPrompt('');
        setQPassage('');
        setQAudioUrl('');
        setQCorrectAnswer('');
        setQOptions(['', '', '', '']);
        loadExamAndStudents();
      } else {
        alert(data.error || 'تعذر إضافة السؤال');
      }
      setSavingQuestion(false);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ');
      setSavingQuestion(false);
    }
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      setGeneratingLink(true);
      const res = await fetch('/api/links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          studentId: selectedStudentId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowLinkModal(false);
        setSelectedStudentId('');
        loadExamAndStudents();
      } else {
        alert(data.error || 'تعذر توليد الرابط');
      }
      setGeneratingLink(false);
    } catch (e) {
      console.error(e);
      setGeneratingLink(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto animate-spin">
            <span className="font-serif-arabic text-amber-700 text-xl font-bold">ض</span>
          </div>
          <p className="text-sm text-slate-500">جاري تحميل بيانات الاختبار...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <p className="text-rose-600 font-bold">الاختبار غير موجود</p>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-900">الرئيسية</Link>
          <span>/</span>
          <Link href="/dashboard/exams" className="hover:text-slate-900">الاختبارات</Link>
          <span>/</span>
          <span className="text-slate-900">{exam.title}</span>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {exam.gradeLevel || 'عام'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {exam.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-arabic">
              {exam.title}
            </h1>
            {exam.description && (
              <p className="text-xs sm:text-sm text-slate-600">{exam.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowQuestionModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-md transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سؤال</span>
            </button>

            <button
              onClick={() => setShowLinkModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-98"
            >
              <Users className="w-4 h-4" />
              <span>توليد رابط لطالب</span>
            </button>
          </div>
        </div>

        {/* 2 Columns: Questions List & Generated Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Questions Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-serif-arabic">
                الأسئلة المضافة ({exam.questions?.length || 0})
              </h2>
              <span className="text-xs font-bold text-amber-700">
                إجمالي الدرجات: {exam.questions?.reduce((acc: number, q: any) => acc + q.marks, 0) || 0} من {exam.totalMarks}
              </span>
            </div>

            {exam.questions?.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-slate-200 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">لا توجد أسئلة في هذا الاختبار بعد</p>
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs"
                >
                  أضف السؤال الأول
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {exam.questions.map((q: any, idx: number) => (
                  <div
                    key={q.id || idx}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {q.type}
                        </span>
                        {q.audioUrl && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 flex items-center gap-1">
                            <Volume2 className="w-3 h-3" /> صوتي
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {q.marks} درجات
                      </span>
                    </div>

                    {q.passage && (
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-700 font-serif-arabic leading-relaxed">
                        {q.passage}
                      </div>
                    )}

                    <p className="text-sm font-bold text-slate-900">{q.prompt}</p>

                    {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl text-xs font-semibold border ${
                              opt === q.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            {opt}
                            {opt === q.correctAnswer && ' ✓ (الإجابة النموذجية)'}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.correctAnswer && !q.options && (
                      <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <strong>الإجابة النموذجية:</strong> {q.correctAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Access Links Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-serif-arabic">
                روابط الطلاب ({exam.links?.length || 0})
              </h2>
            </div>

            {exam.links?.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600">لم يتم توليد روابط بعد</p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  توليد رابط
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {exam.links.map((link: any) => {
                  const studentPhone = link.student.parentPhone || '';
                  const waUrl = generateExamLinkWhatsAppUrl(
                    studentPhone,
                    link.student.name,
                    exam.title,
                    link.accessCode,
                    origin
                  );

                  return (
                    <div
                      key={link.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{link.student.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            link.status === 'GRADED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : link.status === 'SUBMITTED'
                              ? 'bg-blue-100 text-blue-800'
                              : link.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {link.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800">
                        <span>الرمز: {link.accessCode}</span>
                        <button
                          onClick={() => handleCopy(link.accessCode)}
                          className="text-slate-500 hover:text-slate-900 p-1"
                          title="نسخ الرابط"
                        >
                          {copiedCode === link.accessCode ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>إرسال لواتساب الوالد</span>
                        </a>

                        <a
                          href={`/exam/${link.accessCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="معاينة كطالب"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Add Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">إضافة سؤال جديد</h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع السؤال *</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white font-semibold"
                  >
                    <option value="MCQ">اختيار من متعدد (MCQ)</option>
                    <option value="BETWEEN_PARENS">اختر الصواب مما بين القوسين</option>
                    <option value="FILL_IN_BLANK">أكمل مكان النقط</option>
                    <option value="IRAB">إعراب واستخراج نحوي</option>
                    <option value="DICTATION">إملاء صوتي</option>
                    <option value="ESSAY">تعبير / سؤال مقالي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">درجة السؤال</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={qMarks}
                    onChange={(e) => setQMarks(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              {qType === 'DICTATION' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رابط التسجيل الصوتي (Audio URL)</label>
                  <input
                    type="text"
                    value={qAudioUrl}
                    onChange={(e) => setQAudioUrl(e.target.value)}
                    placeholder="مثال: /audio/sample-dictation.wav"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">القطعة أو الفقرة القرائية (اختياري)</label>
                <textarea
                  rows={2}
                  value={qPassage}
                  onChange={(e) => setQPassage(e.target.value)}
                  placeholder="إذا كان السؤال مبنياً على فقرة، اكتبها هنا..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none font-serif-arabic"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص السؤال أو المطلوب *</label>
                <input
                  type="text"
                  required
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  placeholder="مثال: علامة رفع الفاعل المفرد هي..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              {(qType === 'MCQ' || qType === 'BETWEEN_PARENS') && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">الخيارات (اكتب 2 إلى 4 خيارات):</label>
                  <div className="grid grid-cols-2 gap-2">
                    {qOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...qOptions];
                          newOpts[idx] = e.target.value;
                          setQOptions(newOpts);
                        }}
                        placeholder={`الخيار ${idx + 1}`}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الإجابة النموذجية للتصحيح التلقائي
                </label>
                <input
                  type="text"
                  value={qCorrectAnswer}
                  onChange={(e) => setQCorrectAnswer(e.target.value)}
                  placeholder="اكتب الإجابة الصحيحة بالضبط..."
                  className="w-full px-4 py-3 rounded-xl border border-emerald-300 bg-emerald-50/30 text-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs shadow-md"
                >
                  {savingQuestion ? 'جاري الحفظ...' : 'إضافة السؤال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Generator Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">توليد رابط اختبار لطالب</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الطالب من القائمة *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white font-semibold"
                >
                  <option value="">-- اختر طالباً --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.gradeLevel || 'عام'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={generatingLink}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                >
                  {generatingLink ? 'جاري التوليد...' : 'توليد الرابط الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
