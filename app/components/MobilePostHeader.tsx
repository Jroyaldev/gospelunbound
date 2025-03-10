import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Bell, Settings, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface MobilePostHeaderProps {
  title: string;
  backUrl?: string;
  showSearchButton?: boolean;
  onSearchOpen?: () => void;
  hasNotifications?: boolean;
  menuItems?: Array<{
    label: string;
    url: string;
    icon?: React.ReactNode;
  }>;
}

const MobilePostHeader: React.FC<MobilePostHeaderProps> = ({
  title,
  backUrl = '/community',
  showSearchButton = false,
  onSearchOpen,
  hasNotifications = false,
  menuItems = [],
}) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    router.push(backUrl);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled 
            ? 'bg-white shadow-md py-2' 
            : 'bg-gradient-to-br from-[#F8F7F5] to-white py-3'
        }`}
      >
        {/* Background decoration elements - only visible when not scrolled */}
        {!isScrolled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#F0EDE7] rounded-full opacity-40"></div>
            <div className="absolute top-10 -left-10 w-20 h-20 bg-[#FAFAF8] rounded-full opacity-60"></div>
          </div>
        )}
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between relative">
            {/* Back button with dynamic styling */}
            <button
              onClick={handleBack}
              className={`flex items-center mr-2 p-2 rounded-full ${
                isScrolled ? 'text-[#2C2925]' : 'text-[#4A7B61]'
              }`}
              aria-label="Back"
            >
              <ChevronLeft size={24} />
            </button>
            
            {/* Title with dynamic styling */}
            <h1 
              className={`flex-1 text-lg font-medium text-center transition-all ${
                isScrolled ? 'text-[#2C2925]' : 'text-[#2C2925]'
              }`}
            >
              {title}
            </h1>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-1">
              {showSearchButton && (
                <button
                  onClick={onSearchOpen}
                  className={`p-2 rounded-full transition-colors ${
                    isScrolled ? 'text-[#2C2925] hover:bg-[#F8F7F5]' : 'text-[#4A7B61] hover:bg-white/60'
                  }`}
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              )}
              
              {hasNotifications && (
                <button
                  className={`p-2 rounded-full transition-colors ${
                    isScrolled ? 'text-[#2C2925] hover:bg-[#F8F7F5]' : 'text-[#4A7B61] hover:bg-white/60'
                  }`}
                  aria-label="Notifications"
                >
                  <div className="relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </div>
                </button>
              )}
              
              {menuItems.length > 0 && (
                <button
                  onClick={toggleMenu}
                  className={`p-2 rounded-full transition-colors ${
                    isScrolled ? 'text-[#2C2925] hover:bg-[#F8F7F5]' : 'text-[#4A7B61] hover:bg-white/60'
                  }`}
                  aria-label="Menu"
                  aria-expanded={isMenuOpen}
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Menu dropdown */}
      {isMenuOpen && menuItems.length > 0 && (
        <div className="fixed top-16 right-0 z-50 w-48 bg-white rounded-lg shadow-lg overflow-hidden border border-[#E8E6E1] transform transition-all duration-200 origin-top-right">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.url}
                className="flex items-center px-4 py-3 text-[#2C2925] hover:bg-[#F8F7F5] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon && <span className="mr-3 text-[#4A7B61]">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Overlay for menu backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default MobilePostHeader; 