import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from './components/Sidebar';
import LoadingState from './components/LoadingState';
import { AuthProvider } from './context/auth-context';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Gospel Unbound | Exploring Modern Faith',
  description: 'Progressive Christian perspectives that bridge ancient wisdom with modern understanding through courses, resources and community.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="text-foreground h-full antialiased">
        <AuthProvider>
          <div className="flex h-full bg-background selection:bg-foreground/10">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main content area */}
            <div className="flex flex-col min-h-screen w-full lg:pl-64">
              <main className="grow">
                <LoadingState />
                {children}
              </main>
              
              {/* Footer */}
              <footer className="border-t border-border py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground bg-background">
                <div className="mx-auto max-w-[90rem]">
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
                    <p> {new Date().getFullYear()} Gospel Unbound. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                      <a href="/privacy" className="transition hover:text-foreground">
                        Privacy
                      </a>
                      <a href="/terms" className="transition hover:text-foreground">
                        Terms
                      </a>
                      <a href="/contact" className="transition hover:text-foreground">
                        Contact
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
