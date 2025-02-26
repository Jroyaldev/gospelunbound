import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from './components/Sidebar';
import LoadingState from './components/LoadingState';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-black antialiased`}>
        <LoadingState />
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 lg:pl-64 w-full relative z-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
