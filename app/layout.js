import Providers from '@/component/Providers';
import './globals.css';

export const metadata = {
  title: 'RewebTech Dashboard',
  description: 'Internal admin dashboard for RewebTech',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
