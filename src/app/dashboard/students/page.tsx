'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Users, Plus, Phone, Award, BookOpen, Search, X, MessageCircle } from 'lucide-react';

export default function StudentsDirectoryPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add student form
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('الصف الرابع الابتدائي');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          gradeLevel,
          parentName: parentName.trim() || undefined,
          parentPhone: parentPhone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setName('');
        setParentName('');
        setParentPhone('');
        setNotes('');
        loadStudents();
      } else {
        alert(data.error || 'تعذر إضافة الطالب');
      }
      setSaving(false);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ');
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.gradeLevel && s.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.parentPhone && s.parentPhone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-arabic">
              سجل الطلاب وأولياء الأمور
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              إدارة بيانات الطلاب، متابعة الإنجاز، والتواصل السريع عبر واتساب
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-98"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة طالب جديد</span>
          </button>
        </div>

        {/* Search & Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث بالاسم أو المرحلة أو رقم الهاتف..."
            className="w-full text-sm outline-none bg-transparent"
          />
        </div>

        {/* Students Table / Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto animate-spin mb-3">
              <span className="font-serif-arabic text-amber-700 text-xl font-bold">ض</span>
            </div>
            <p className="text-sm text-slate-500">جاري تحميل قائمة الطلاب...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-4 max-w-lg mx-auto">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">لا يوجد طلاب مطابقين للبحث</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {s.gradeLevel || 'عام'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {s.examLinks?.length || 0} اختبارات
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">{s.name}</h3>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ولي الأمر:</span>
                      <span className="font-bold text-slate-800">{s.parentName || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">رقم الهاتف:</span>
                      <span className="font-mono font-bold text-slate-800">{s.parentPhone || '—'}</span>
                    </div>
                  </div>
                </div>

                {s.parentPhone && (
                  <a
                    href={`https://wa.me/${s.parentPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-200"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>مراسلة عبر واتساب</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 font-serif-arabic">إضافة طالب جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب الرباعي *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: يوسف أحمد عبد الرحمن"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة الدراسية</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white font-semibold"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم ولي الأمر</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="أ/ أحمد"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم واتساب ولي الأمر</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="2010xxxxxxxx"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات تعليمية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات حول مستوى الطالب أو نقاط القوة والضعف..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الطالب'}
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
