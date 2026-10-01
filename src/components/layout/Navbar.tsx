'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Award, Users, FileText, Menu, X, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-amber-500/80 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif-arabic text-amber-400 text-2xl font-bold">ض</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  منصة لغتي الجميلة
                </span>
              </div>
              <span className="font-serif-arabic text-xl font-bold text-slate-900 tracking-tight">
                أ/ ضُحَىٰ مُصْطَفَى
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              الرئيسية
            </Link>
            <Link
              href="/#features"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              مميزات المنصة
            </Link>
            <Link
              href="/#exam-entry"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              دخول الامتحان
            </Link>
          </nav>

          {/* Teacher Portal CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-xl transition-colors"
            >
              <span>تسجيل الدخول</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-medium text-sm shadow-sm transition-all hover:shadow-md active:scale-98"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>لوحة المعلمة</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            الرئيسية
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            مميزات المنصة
          </Link>
          <Link
            href="/#exam-entry"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            دخول الامتحان برمز الوصول
          </Link>
          <div className="pt-3 space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-base border border-emerald-200"
            >
              <span>تسجيل الدخول للمعلمة</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-900 text-amber-400 font-medium text-base shadow-sm"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>لوحة تحكم المعلمة</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
