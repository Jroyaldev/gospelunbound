'use client';

import { useState, useEffect } from 'react';
import { Home, FileText, BookOpen, Users, Info, Menu, X } from 'lucide-react';
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
          className="inline-flex items-center justify-center rounded-full p-3 text-foreground hover:bg-[#F5F0E8]/50 hover:text-foreground focus:outline-none bg-white border border-[#F5F0E8] shadow-sm transition-all duration-300 min-h-[44px] min-w-[44px]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
        >
          <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
          {mobileMenuOpen ? (
            <X className="block h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
          ) : (
            <Menu className="block h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Close button inside sidebar for mobile */}
      {mobileMenuOpen && (
        <div className="fixed top-4 right-4 z-[60] lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-3 text-white hover:bg-[#F5F0E8]/90 hover:text-foreground focus:outline-none bg-foreground shadow-sm transition-all duration-300 min-h-[44px] min-w-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">Close main menu</span>
            <X className="block h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Sidebar for desktop and mobile */}
      <aside 
        className={`fixed inset-y-0 flex w-[85%] sm:w-72 flex-col bg-white z-50 transition-all duration-300 ease-in-out lg:translate-x-0 lg:w-64 shadow-sm ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Content */}
        <div className="relative flex-1 flex flex-col border-r border-[#F5F0E8] h-full">
          {/* Logo */}
          <div className="flex h-16 sm:h-20 items-center px-4 pt-6 sm:px-6">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 group transition-all duration-200 min-h-[44px]">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 bg-[#D7A392]/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#D7A392]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 12.5722C19.5 11.9309 19.2060 11.3291 18.7 10.9235C19.2847 10.2964 19.4947 9.43714 19.2647 8.63271C19.0348 7.82828 18.4012 7.19496 17.6 6.96006C17.6 6.26167 17.3155 5.59163 16.8089 5.0851C16.3024 4.57857 15.6324 4.29402 14.934 4.29402C14.2356 4.29402 13.5656 4.57857 13.0591 5.0851C12.5525 5.59163 12.268 6.26167 12.268 6.96006C11.4668 7.19496 10.8332 7.82828 10.6033 8.63271C10.3733 9.43714 10.5833 10.2964 11.168 10.9235C10.6066 11.3704 10.3126 12.0424 10.32 12.7504V13.164L7.32396 15.0587C6.58333 15.5196 6.09141 16.2988 6 17.1696V19.5H24V17.1696C23.9086 16.2988 23.4166 15.5196 22.676 15.0587L19.68 13.164V12.7504C19.68 12.6903 19.5 12.6361 19.5 12.5722Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 10.5H15.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M0 19.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-base sm:text-lg text-foreground tracking-tight whitespace-nowrap">
                  <span className="font-medium">Gospel</span>
                  <span className="text-muted-foreground">Unbound</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 sm:px-6 py-6 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              
              // Determine the color scheme based on the navigation item
              let bgColor = '';
              let iconColor = '';
              let hoverColor = 'hover:bg-[#F5F0E8]/20';
              
              if (item.name === 'Courses') {
                bgColor = isActive ? 'bg-[#D7A392]/10' : '';
                iconColor = isActive ? 'text-[#D7A392]' : '';
                hoverColor = 'hover:bg-[#D7A392]/10 hover:text-[#D7A392]';
              } else if (item.name === 'Resources') {
                bgColor = isActive ? 'bg-[#E8D5C8]/10' : '';
                iconColor = isActive ? 'text-[#E8D5C8]' : '';
                hoverColor = 'hover:bg-[#E8D5C8]/10 hover:text-[#E8D5C8]';
              } else if (item.name === 'Community') {
                bgColor = isActive ? 'bg-[#D2D3C9]/10' : '';
                iconColor = isActive ? 'text-[#D2D3C9]' : '';
                hoverColor = 'hover:bg-[#D2D3C9]/10 hover:text-[#D2D3C9]';
              } else {
                bgColor = isActive ? 'bg-[#F5F0E8]/30' : '';
                iconColor = isActive ? 'text-foreground' : '';
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-300 min-h-[44px] ${
                    isActive 
                      ? `${bgColor} ${iconColor}` 
                      : `text-muted-foreground ${hoverColor}`
                  }`}
                  style={{ 
                    transitionDelay: mounted ? `${index * 50}ms` : '0ms',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-10px)'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={`h-[18px] w-[18px] transition-all ${
                    isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                  } ${iconColor}`} strokeWidth={1.5} />
                  <span className="tracking-tight">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Newsletter signup mini-form */}
          <div className="px-4 sm:px-6 py-4 mb-4">
            <div className="bg-[#F5F0E8]/20 rounded-xl p-4">
              <p className="text-xs font-medium mb-2 text-foreground">Stay updated</p>
              <p className="text-xs text-muted-foreground mb-3">Get our weekly newsletter for new resources</p>
              <div className="rounded-full bg-white border border-[#F5F0E8] flex overflow-hidden transition-shadow duration-300 hover:shadow-sm focus-within:border-[#D7A392]/50 focus-within:ring-1 focus-within:ring-[#D7A392]/30">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="w-full text-xs py-2 px-3 border-none focus:outline-none bg-transparent"
                />
                <button className="bg-foreground text-white text-xs py-2 px-3 whitespace-nowrap font-medium">
                  Sign up
                </button>
              </div>
            </div>
          </div>

          {/* Footer element */}
          <div className="px-4 sm:px-6 py-4 mt-auto border-t border-[#F5F0E8]">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Gospel Unbound</span>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
