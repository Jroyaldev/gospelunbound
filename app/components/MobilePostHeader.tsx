import React from 'react';

interface MobilePostHeaderProps {
  title?: string;
  tabs?: {
    id: string;
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }[];
}

const MobilePostHeader = ({
  title = 'Community',
  tabs = []
}: MobilePostHeaderProps): JSX.Element => {
  return (
    <div className="sticky top-0 z-10 bg-white">
      {/* Title bar */}
      <div className="relative px-4 py-3 flex items-center">
        {/* Title (centered) */}
        <h1 className="text-2xl font-bold w-full text-center text-[#2C2925]">
          {title}
        </h1>
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex border-b border-[#E8E6E1]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex-1 py-3 text-center text-base relative ${
                tab.isActive 
                  ? 'font-bold text-[#2C2925]' 
                  : 'font-normal text-[#706C66]'
              }`}
            >
              {tab.label}
              {tab.isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4A7B61]"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobilePostHeader; 