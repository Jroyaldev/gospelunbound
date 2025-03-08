import React from 'react';

interface MobileFooterProps {
  year?: number;
}

const MobileFooter = ({ 
  year = new Date().getFullYear()
}: MobileFooterProps): JSX.Element => {
  return (
    <div className="border-t border-[#E8E6E1] bg-[#FFFFFF]">
      {/* Empty footer - no development domain displayed */}
    </div>
  );
};

export default MobileFooter; 