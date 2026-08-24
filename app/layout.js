import './globals.css';

export const metadata = {
  title: 'RewebTech Dashboard',
  description: 'Internal admin dashboard for RewebTech',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#060f21] text-gray-100 antialiased">{children}</body>
    </html>
  );
}
