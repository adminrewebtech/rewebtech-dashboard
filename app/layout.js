import { Inter } from 'next/font/google';
import './globals.css';

/**
 * next/font build ke waqt font ko self-host kar leta hai — koi runtime request
 * Google ko nahi jaati, aur layout shift bhi nahi hota.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'RewebTech Dashboard',
  description: 'Internal admin dashboard for RewebTech',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#f4f7fc] font-[family-name:var(--font-inter)] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
