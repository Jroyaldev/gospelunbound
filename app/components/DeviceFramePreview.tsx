import React from 'react';

interface DeviceFramePreviewProps {
  url: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  label?: string;
}

const DeviceFramePreview: React.FC<DeviceFramePreviewProps> = ({
  url,
  deviceType = 'mobile',
  label
}) => {
  const frameClasses = {
    mobile: 'w-[320px] h-[640px] border-[8px]',
    tablet: 'w-[768px] h-[1024px] border-[12px]',
    desktop: 'w-[1280px] h-[800px] border-[16px]'
  };

  return (
    <div className="flex flex-col items-center my-4">
      {label && (
        <div className="text-sm text-muted-foreground mb-2">{label}</div>
      )}
      <div className={`relative ${frameClasses[deviceType]} rounded-[36px] border-black/80 bg-black/80 overflow-hidden shadow-lg`}>
        <iframe
          src={url}
          className="w-full h-full bg-white"
          title={`Preview in ${deviceType} view`}
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default DeviceFramePreview;
