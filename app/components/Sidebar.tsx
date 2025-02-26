'use client';

import { useState, useEffect } from 'react';
import { Home, FileText, BookOpen, Users, Info, Heart, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Resources', href: '/resources', icon: FileText },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'About', href: '/about', icon: Info },
];

export default function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Set mounted state after component mounts for animations
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <div className={`fixed top-4 left-4 z-50 lg:hidden transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:bg-black/20 hover:text-white focus:outline-none backdrop-blur-lg bg-black/30 border border-white/10 shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-105"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
        >
          <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
          {mobileMenuOpen ? (
            <X className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="block h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Close button inside sidebar for mobile */}
      {mobileMenuOpen && (
        <div className="fixed top-4 right-4 z-[60] lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:bg-black/20 hover:text-white focus:outline-none backdrop-blur-lg bg-black/50 border border-white/10 shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-105"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">Close main menu</span>
            <X className="block h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Sidebar for desktop and mobile */}
      <aside 
        className={`fixed inset-y-0 flex w-72 flex-col bg-black/95 backdrop-blur-xl border-r border-white/[0.08] z-50 transition-all duration-500 ease-in-out lg:translate-x-0 lg:w-64 lg:bg-black/20 lg:z-30 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Glass Overlay - only for desktop */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none lg:opacity-100 opacity-30" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-20 pointer-events-none">
          <div className="w-[20rem] h-[20rem] rounded-full bg-purple-800/20 blur-3xl animate-pulse" />
        </div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 opacity-20 pointer-events-none">
          <div className="w-[15rem] h-[15rem] rounded-full bg-blue-800/20 blur-3xl animate-pulse" 
               style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Content */}
        <div className="relative flex-1 flex flex-col">
          {/* Logo */}
          <div className="flex h-24 items-center justify-center px-5 mb-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 group transition-all duration-300 hover:scale-105">
              <div className="relative flex-shrink-0">
                <Heart className="w-8 h-8 text-white group-hover:text-purple-300 transition-colors" strokeWidth={1.5} />
              </div>
              <div className="flex items-center">
                <span className="text-xl text-white tracking-wide whitespace-nowrap">
                  <span className="font-bold text-white">Gospel</span>
                  <span className="font-extralight text-white/90">Unbound</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-3 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/[0.12] text-white shadow-md shadow-black/10 border border-white/10' 
                      : 'text-white/70 hover:bg-white/[0.08] hover:text-white hover:border hover:border-white/10'
                  }`}
                  style={{ 
                    transitionDelay: mounted ? `${index * 50}ms` : '0ms',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-10px)'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={`p-1.5 rounded-md ${isActive ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' : 'bg-transparent group-hover:bg-gradient-to-br group-hover:from-purple-500/10 group-hover:to-blue-500/10'} transition-all duration-200`}>
                    <item.icon className={`h-[18px] w-[18px] transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                    }`} />
                  </div>
                  <span className="tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Decorative footer element instead of login section */}
          <div className="px-3 py-4 mt-auto border-t border-white/[0.08]">
            <div className="flex items-center justify-center opacity-60 text-[13px] text-white/70">
              Gospel Unbound &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
