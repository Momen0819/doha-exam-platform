'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  Plus, 
  ArrowLeft, 
  ExternalLink,
  Sparkles,
  BarChart3,
  FileCheck2
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>لوحة تحكم المعلمة المعتمدة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-arabic">
              مرحباً بكِ، أ/ ضُحَىٰ مُصْطَفَى 🌸
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              متابعة الاختبارات، توليد الروابط، تصحيح الإجابات، وإرسال النتائج لأولياء الأمور
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/exams"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-sm shadow-md transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء اختبار جديد</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">إجمالي الاختبارات</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {loading ? '...' : data?.totalExams ?? 0}
            </div>
            <p className="text-xs text-slate-400">نماذج امتحانات وتدريبات نشطة</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">الطلاب المسجلون</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {loading ? '...' : data?.totalStudents ?? 0}
            </div>
            <p className="text-xs text-slate-400">طالب وطالبة في المرحلة الابتدائية</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">روابط الاختبارات الصادرة</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {loading ? '...' : data?.totalLinks ?? 0}
            </div>
            <p className="text-xs text-slate-400">
              تم تسليم <strong className="text-slate-700">{data?.submittedLinks ?? 0}</strong> منها
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">متوسط الدرجات العام</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {loading ? '...' : `${data?.averageScore ?? 0}%`}
            </div>
            <p className="text-xs text-slate-400">أداء متميز للطلاب</p>
          </div>

        </div>

        {/* Quick Links & Recent Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Exams List (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-serif-arabic">أحدث الاختبارات</h2>
              <Link
                href="/dashboard/exams"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>عرض الكل</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="text-xs text-slate-400 py-4 text-center">جاري تحميل الاختبارات...</p>
              ) : data?.recentExams?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">لا توجد اختبارات مضافة حتى الآن</p>
              ) : (
                data?.recentExams?.map((ex: any) => (
                  <div
                    key={ex.id}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/20 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{ex.title}</h4>
                        {ex.gradeLevel && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {ex.gradeLevel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{ex._count?.questions || 0} أسئلة</span>
                        <span>•</span>
                        <span>{ex.durationMins} دقيقة</span>
                        <span>•</span>
                        <span>{ex._count?.links || 0} طالب مرتبط</span>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/exams/${ex.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      إدارة
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-700 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-serif-arabic text-2xl font-bold">
                ض
              </div>
              <h3 className="text-xl font-bold font-serif-arabic text-white">روابط وإجراءات سريعة</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                يمكنك إنشاء روابط الاختبارات للطلاب دفعة واحدة ومشاركتها عبر واتساب مع أولياء الأمور فوراً.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard/students"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600/60 text-xs font-bold text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>دليل الطلاب وأرقام أولياء الأمور</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/grading"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600/60 text-xs font-bold text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>غرفة التصحيح والمراجعة اليدوية</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
