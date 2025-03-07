import React from 'react';

interface MobileFooterProps {
  year?: number;
  ipAddress?: string;
}

const MobileFooter = ({ 
  year = new Date().getFullYear(),
  ipAddress = '192.168.254.73' // This would typically come from an API call
}: MobileFooterProps): JSX.Element => {
  return (
    <div className="border-t border-[#E8E6E1] bg-[#FFFFFF] text-center">
      <div className="py-2 px-4">
        <div className="text-[#555555] text-center text-sm">
          {ipAddress}
        </div>
      </div>
    </div>
  );
};

export default MobileFooter; 