'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Home, 
  Book, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { PATHS } from '@/app/lib/supabase/auth-config';

export interface SidebarProps {
  mobile?: boolean;
}

// Navigation items structure
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  active?: boolean;
}

const navigation = [
  { label: 'Home', href: '/', icon: Home, active: true },
  { label: 'Courses', href: '/courses', icon: Book },
  { label: 'Resources', href: '/resources', icon: FileText },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: BarChart },
];

const secondaryNavigation = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help', href: '/help', icon: HelpCircle },
];

export default function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  
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

  // Toggle mobile menu
  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Render sidebar nav item
  const renderNavItem = (item: NavItem) => (
    <li key={item.label}>
      <Link 
        href={item.href}
        className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 
          ${item.active 
            ? 'bg-[#4A7B61]/10 text-[#4A7B61] font-medium' 
            : 'text-[#706C66] hover:bg-[#F8F7F2] hover:text-[#4A7B61]'
          }`}
      >
        <item.icon strokeWidth={1.5} className="mr-3 h-5 w-5" />
        {item.label}
      </Link>
    </li>
  );

  // Handle logout
  const handleSignOut = async () => {
    await signOut();
    toggleMenu(); // Close mobile menu if open
  };

  // Authentication section rendering
  const renderAuthSection = () => {
    if (isLoading) {
      return (
        <div className="px-3 py-4">
          <div className="rounded-lg bg-[#F8F7F2] p-3">
            <div className="flex items-center">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-[#4A7B61]/20 animate-pulse"></div>
              <div className="ml-2 space-y-1">
                <div className="h-2 w-20 bg-[#4A7B61]/20 rounded animate-pulse"></div>
                <div className="h-2 w-16 bg-[#4A7B61]/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (user) {
      // User is logged in
      return (
        <div className="px-3 py-4">
          <div className="rounded-lg bg-[#F8F7F2] p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-[#4A7B61]/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-[#4A7B61]">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-2">
                  <p className="text-xs font-medium text-[#2C2925]">
                    {user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-[#706C66]">Member</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-md text-[#706C66] hover:bg-[#E8E6E1] hover:text-[#2C2925] transition-colors"
                aria-label="Sign out"
              >
                <LogOut strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </div>
          </div>
          <Link 
            href="/profile" 
            className="mt-2 flex items-center rounded-lg px-3 py-2 text-sm text-[#706C66] hover:bg-[#F8F7F2] hover:text-[#4A7B61] w-full"
          >
            <User strokeWidth={1.5} className="mr-3 h-5 w-5" />
            View Profile
          </Link>
        </div>
      );
    }

    // User is not logged in
    return (
      <div className="px-3 py-4 space-y-2">
        <Link 
          href={PATHS.SIGN_IN}
          className="flex items-center justify-center rounded-lg bg-[#4A7B61] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#3E6651] transition-colors w-full"
        >
          <LogIn strokeWidth={1.5} className="mr-2 h-4 w-4" />
          Sign In
        </Link>
        <Link 
          href={PATHS.SIGN_UP}
          className="flex items-center justify-center rounded-lg bg-white border border-[#E8E6E1] px-3 py-2.5 text-sm font-medium text-[#2C2925] hover:bg-[#F8F7F2] transition-colors w-full"
        >
          <UserPlus strokeWidth={1.5} className="mr-2 h-4 w-4" />
          Sign Up
        </Link>
      </div>
    );
  };

  // Common sidebar content
  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center">
          <span className="text-lg font-semibold tracking-tight text-[#2C2925]">Gospel Unbound</span>
        </Link>
        
        <button 
          onClick={toggleMenu}
          className="rounded-lg p-1.5 text-[#706C66] transition-colors hover:bg-[#F8F7F2] hover:text-[#2C2925]"
          aria-label="Close menu"
        >
          <X strokeWidth={1.5} className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-2 flex flex-1 flex-col justify-between overflow-y-auto">
        <nav className="space-y-1 px-2">
          <ul className="space-y-1">
            {navigation.map(renderNavItem)}
          </ul>
          
          <div className="my-4 h-px bg-[#E8E6E1]" />
          
          <ul className="space-y-1">
            {secondaryNavigation.map(renderNavItem)}
          </ul>
        </nav>
        
        {/* Authentication section */}
        {renderAuthSection()}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className={`fixed top-4 left-4 z-50 lg:hidden transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-3 text-foreground hover:bg-[#F8F7F2] hover:text-foreground focus:outline-none bg-white border border-[#F8F7F2] shadow-sm transition-all duration-300 min-h-[44px] min-w-[44px]"
          onClick={toggleMenu}
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
          className="fixed inset-0 z-40 bg-[#2C2925]/30 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={toggleMenu}
        />
      )}

      {/* Close button inside sidebar for mobile */}
      {mobileMenuOpen && (
        <div className="fixed top-4 right-4 z-[60] lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-3 text-white hover:bg-[#F8F7F2] hover:text-foreground focus:outline-none bg-[#2C2925] shadow-sm transition-all duration-300 min-h-[44px] min-w-[44px]"
            onClick={toggleMenu}
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
        <div className="relative flex-1 flex flex-col border-r border-[#E8E6E1] h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
