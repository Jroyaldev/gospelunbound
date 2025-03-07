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
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { PATHS } from '@/app/lib/supabase/auth-config';
import { getProfile } from '@/app/lib/supabase/database';
import { Profile } from '@/app/lib/types';

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
  { label: 'Home', href: '/', icon: Home },
  { label: 'Courses', href: '/courses', icon: Book },
  { label: 'Resources', href: '/resources', icon: FileText },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: BarChart },
];

const secondaryNavigation = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help', href: '/help', icon: HelpCircle },
];

// Fix for TypeScript linter errors
// Convert components to any type as a workaround
const TypedLink = Link as any;
const TypedLogOut = LogOut as any;
const TypedUser = User as any;
const TypedLogIn = LogIn as any;
const TypedUserPlus = UserPlus as any;

export default function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  
  // Set mounted state after component mounts for animations
  useEffect(() => {
    // Use requestAnimationFrame to ensure we update after browser paint
    const raf = requestAnimationFrame(() => {
      setMounted(true);
    });
    
    return () => cancelAnimationFrame(raf);
  }, []);
  
  // Load user profile when user is authenticated
  useEffect(() => {
    async function fetchUserProfile() {
      if (user?.id) {
        try {
          const profile = await getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    }
    
    fetchUserProfile();
  }, [user]);
  
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
  const renderNavItem = (item: NavItem) => {
    // Check if the current path matches the item's href
    const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname.startsWith(item.href));
                    
    return (
      <li key={item.label}>
        <TypedLink 
          href={item.href}
          className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 
            ${isActive 
              ? 'bg-[#4A7B61]/10 text-[#4A7B61] font-medium' 
              : 'text-[#706C66] hover:bg-[#F8F7F2] hover:text-[#4A7B61]'
            }`}
        >
          <div className={`rounded-full p-2 mr-3 transition-transform group-hover:scale-110 
            ${isActive ? 'bg-[#4A7B61]/10' : 'bg-transparent group-hover:bg-[#F8F7F2]'}`}>
            <item.icon strokeWidth={1.5} className={`h-4 w-4 ${isActive ? 'text-[#4A7B61]' : 'text-[#706C66] group-hover:text-[#4A7B61]'}`} />
          </div>
          {item.label}
        </TypedLink>
      </li>
    );
  };

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
          <div className="rounded-xl bg-[#F8F7F2] p-4">
            <div className="flex items-center">
              <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[#4A7B61]/20 animate-pulse"></div>
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
          <div className="rounded-xl bg-[#F8F7F2] p-4 border border-[#E8E6E1]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {userProfile?.avatar_url ? (
                  <div className="h-9 w-9 flex-shrink-0 rounded-full overflow-hidden border border-[#E8E6E1] bg-white shadow-sm">
                    <img 
                      src={userProfile.avatar_url} 
                      alt={`${userProfile.full_name || 'User'}'s profile`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const nextSibling = e.currentTarget.nextElementSibling as HTMLDivElement;
                        if (nextSibling) nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden h-full w-full items-center justify-center bg-[#4A7B61]/20">
                      <span className="text-sm font-medium text-[#4A7B61]">
                        {(userProfile.full_name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[#4A7B61]/20 flex items-center justify-center border border-[#4A7B61]/30 shadow-sm">
                    <span className="text-sm font-medium text-[#4A7B61]">
                      {(userProfile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="ml-2.5">
                  <p className="text-sm font-medium text-[#2C2925]">
                    {userProfile?.full_name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-[#706C66]">Member</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full text-[#706C66] hover:bg-white hover:text-[#2C2925] transition-colors border border-transparent hover:border-[#E8E6E1] shadow-sm"
                aria-label="Sign out"
              >
                <TypedLogOut strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </div>
          </div>
          <TypedLink 
            href="/profile" 
            className="mt-2 group flex items-center rounded-lg px-4 py-2.5 text-sm text-[#706C66] hover:bg-[#F8F7F2] hover:text-[#4A7B61] w-full transition-all duration-200"
          >
            <div className="rounded-full p-1.5 mr-3 transition-transform group-hover:scale-110 group-hover:bg-[#4A7B61]/10">
              <TypedUser strokeWidth={1.5} className="h-4 w-4 group-hover:text-[#4A7B61]" />
            </div>
            View Profile
          </TypedLink>
        </div>
      );
    }

    // User is not logged in
    return (
      <div className="px-3 py-4 space-y-2.5">
        <TypedLink 
          href={PATHS.SIGN_IN}
          className="flex items-center justify-center rounded-lg bg-[#4A7B61] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3D644E] transition-colors w-full shadow-sm"
        >
          <TypedLogIn strokeWidth={1.5} className="mr-2 h-4 w-4" />
          Sign In
        </TypedLink>
        <TypedLink 
          href={PATHS.SIGN_UP}
          className="flex items-center justify-center rounded-lg bg-white border border-[#E8E6E1] px-4 py-2.5 text-sm font-medium text-[#2C2925] hover:bg-[#F8F7F2] transition-colors w-full shadow-sm"
        >
          <TypedUserPlus strokeWidth={1.5} className="mr-2 h-4 w-4" />
          Sign Up
        </TypedLink>
      </div>
    );
  };

  // Common sidebar content
  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#E8E6E1]">
        <TypedLink href="/" className="flex items-center">
          <div className="h-9 w-9 rounded-lg overflow-hidden flex-shrink-0 mr-2">
            <Image 
              src="/images/angelo brewing.png" 
              alt="Gospel Unbound Logo" 
              width={36} 
              height={36} 
              className="object-cover"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#2C2925]">Gospel Unbound</span>
        </TypedLink>
        
        <button 
          onClick={toggleMenu}
          className="rounded-lg p-2 text-[#706C66] transition-colors hover:bg-[#F8F7F2] hover:text-[#2C2925] lg:hidden"
          aria-label="Close menu"
        >
          <X strokeWidth={1.5} className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-3 flex flex-1 flex-col justify-between overflow-y-auto px-2">
        <nav className="space-y-2">
          <h2 className="px-4 text-xs font-medium uppercase tracking-wider text-[#706C66] mb-2">Main Navigation</h2>
          <ul className="space-y-1">
            {navigation.map(renderNavItem)}
          </ul>
          
          <div className="my-4 h-px bg-[#E8E6E1] mx-2" />
          
          <h2 className="px-4 text-xs font-medium uppercase tracking-wider text-[#706C66] mb-2">Support</h2>
          <ul className="space-y-1">
            {secondaryNavigation.map(renderNavItem)}
          </ul>
        </nav>
        
        {/* Authentication section */}
        <div className="mt-4 mb-6">
          {renderAuthSection()}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className={`fixed top-6 left-4 z-50 lg:hidden transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-3.5 text-white hover:bg-[#3A6B51] focus:outline-none bg-[#4A7B61] border border-[#4A7B61] shadow-lg transition-all duration-300 min-h-[46px] min-w-[46px]"
          onClick={toggleMenu}
          aria-expanded={mobileMenuOpen}
        >
          <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
          {mobileMenuOpen ? (
            <X className="block h-5 w-5" aria-hidden="true" strokeWidth={2} />
          ) : (
            <Menu className="block h-5 w-5" aria-hidden="true" strokeWidth={2} />
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

      {/* Sidebar for desktop and mobile */}
      <aside 
        className={`fixed inset-y-0 flex w-[85%] sm:w-72 flex-col bg-white z-50 transition-all duration-300 ease-in-out lg:translate-x-0 lg:w-64 border-r border-[#E8E6E1] ${
          mobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'
        } ${mounted ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}
      >
        {/* Content */}
        <div className="relative flex-1 flex flex-col h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
