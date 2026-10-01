'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Plus, BookOpen, Clock, Award, Users, ChevronLeft, Sparkles, X, Check } from 'lucide-react';

export default function ExamsManagementPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New exam form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gradeLevel, setGradeLevel] = useState('الصف الرابع الابتدائي');
  const [durationMins, setDurationMins] = useState(30);
  const [totalMarks, setTotalMarks] = useState(20);
  const [saving, setSaving] = useState(false);

  const loadExams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/exams');
      const data = await res.json();
      if (data.success) {
        setExams(data.data);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          gradeLevel,
          durationMins: Number(durationMins),
          totalMarks: Number(totalMarks),
          questions: [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        loadExams();
      } else {
        alert(data.error || 'تعذر إنشاء الاختبار');
      }
      setSaving(false);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-arabic">
              إدارة الاختبارات والتدريبات
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              إنشاء نماذج الأسئلة وتوليد الروابط المخصصة للطلاب
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-sm shadow-md transition-all active:scale-98"
          >
            <Plus className="w-5 h-5" />
            <span>إنشاء اختبار جديد</span>
          </button>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto animate-spin mb-3">
              <span className="font-serif-arabic text-amber-700 text-xl font-bold">ض</span>
            </div>
            <p className="text-sm text-slate-500">جاري تحميل الاختبارات...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-4 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">لا توجد اختبارات مضافة حالياً</h3>
            <p className="text-xs text-slate-500">ابدأ بإنشاء أول اختبار لغوي تفاعلي لطلابك الآن</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs"
            >
              إنشاء أول اختبار
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {exam.gradeLevel || 'عام'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {exam.questions?.length || 0} أسئلة
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-serif-arabic line-clamp-2">
                    {exam.title}
                  </h3>

                  {exam.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{exam.description}</p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <div className="text-slate-400 text-[10px]">الزمن</div>
                      <div className="font-bold text-slate-800">{exam.durationMins} د</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <div className="text-slate-400 text-[10px]">الدرجة</div>
                      <div className="font-bold text-slate-800">{exam.totalMarks} د</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <div className="text-slate-400 text-[10px]">الروابط</div>
                      <div className="font-bold text-slate-800">{exam._count?.links || 0}</div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/exams/${exam.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 group-hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>إدارة الأسئلة والروابط</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">إنشاء اختبار جديد</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الاختبار *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: اختبار نحو وإملاء - الجملة الاسمية"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة الدراسية</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none bg-white"
                >
                  <option>الصف الأول الابتدائي</option>
                  <option>الصف الثاني الابتدائي</option>
                  <option>الصف الثالث الابتدائي</option>
                  <option>الصف الرابع الابتدائي</option>
                  <option>الصف الخامس الابتدائي</option>
                  <option>الصف السادس الابتدائي</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الزمن (بالدقائق)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الدرجة الكلية</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات أو وصف إضافي</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للوحدة أو القواعد المشمولة في هذا الاختبار..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-md transition-all"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ ومتابعة الأسئلة'}
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
