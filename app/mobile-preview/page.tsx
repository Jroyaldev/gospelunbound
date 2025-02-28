import DeviceFramePreview from '../components/DeviceFramePreview';

export default function MobilePreviewPage() {
  return (
    <div className="p-8 max-w-full mx-auto">
      <h1 className="text-2xl font-medium mb-6">Mobile Preview</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        This page allows you to preview how your site looks on different devices without leaving your development environment.
      </p>
      
      <div className="flex flex-wrap justify-center gap-8">
        <DeviceFramePreview 
          url="/"
          deviceType="mobile"
          label="Mobile View (320px width)"
        />
      </div>
    </div>
  );
}
