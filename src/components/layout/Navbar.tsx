'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, LogOut, UserCheck } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teacher, setTeacher] = useState<{ id: string; name: string; username?: string } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.teacher) {
            setTeacher(data.teacher);
          } else {
            setTeacher(null);
          }
        } else {
          setTeacher(null);
        }
      } catch {
        setTeacher(null);
      } finally {
        setLoadingAuth(false);
      }
    }

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setTeacher(null);
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

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
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/' ? 'text-emerald-800 bg-emerald-50/80 font-bold' : 'text-slate-700 hover:text-emerald-900 hover:bg-slate-100'
              }`}
            >
              الرئيسية
            </Link>
            <Link
              href="/#features"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              مميزات المنصة
            </Link>
            <Link
              href="/#exam-entry"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              دخول الامتحان
            </Link>
          </nav>

          {/* Teacher Portal CTA */}
          <div className="hidden md:flex items-center gap-3">
            {!loadingAuth && teacher ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>{teacher.name}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-medium text-sm shadow-sm transition-all hover:shadow-md active:scale-98"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span>لوحة المعلمة</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="تسجيل الخروج"
                  className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-sm shadow-sm transition-all hover:shadow-md active:scale-98"
              >
                <span>دخول المعلمة</span>
              </Link>
            )}
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
            {!loadingAuth && teacher ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-900 text-amber-400 font-medium text-base shadow-sm"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>لوحة تحكم المعلمة</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-base border border-rose-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-900 text-amber-400 font-bold text-base shadow-sm"
              >
                <span>تسجيل دخول المعلمة</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
