import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface ThankYouProps {
  onComplete: () => void;
  autoResetDelay?: number;
}

const ThankYou = ({ onComplete, autoResetDelay = 3000 }: ThankYouProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, autoResetDelay);

    return () => clearTimeout(timer);
  }, [onComplete, autoResetDelay]);

  return (
    <div className="kiosk-container items-center justify-center px-8 py-12">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-success/10 border-4 border-success/20">
            <CheckCircle className="w-16 h-16 text-success animate-pulse" />
          </div>
        </div>

        {/* Thank You Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Thank You!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto">
            Your feedback has been saved and will help us improve our service.
          </p>
        </div>

        {/* Auto-reset indicator */}
        <div className="pt-8">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-muted rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Returning to start screen...
            </span>
          </div>
        </div>

        {/* Optional QR code placeholder for extended survey */}
        <div className="pt-12 opacity-60">
          <p className="text-sm text-muted-foreground mb-4">
            Want to provide more detailed feedback?
          </p>
          <div className="inline-block p-4 bg-card border-2 border-dashed border-border rounded-lg">
            <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center">
                QR Code<br />Placeholder
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;