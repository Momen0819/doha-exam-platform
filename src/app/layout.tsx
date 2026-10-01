import type { Metadata } from 'next';
import { Tajawal, Amiri } from 'next/font/google';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'منصة اختبارات اللغة العربية | أ/ ضحى مصطفى',
  description: 'المنصة التعليمية التفاعلية لتقييم واختبارات طلاب المرحلة الابتدائية في قواعد اللغة العربية والإملاء والتعبير تحت إشراف أ/ ضحى مصطفى.',
  icons: {
    icon: '/logo-primary.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${amiri.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
