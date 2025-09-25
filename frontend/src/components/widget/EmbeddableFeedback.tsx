import { useState, useCallback } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveFeedbackOffline, syncPendingFeedback } from "@/lib/offline-storage";

interface EmbeddableFeedbackProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor?: string;
  companyName?: string;
}

const EmbeddableFeedback = ({ 
  position = "bottom-right", 
  primaryColor = "hsl(var(--primary))",
  companyName = "Company"
}: EmbeddableFeedbackProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"rating" | "form" | "thanks">("rating");
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emojis = [
    { emoji: "😞", rating: 1 },
    { emoji: "😕", rating: 2 },
    { emoji: "😐", rating: 3 },
    { emoji: "😊", rating: 4 },
    { emoji: "😄", rating: 5 },
  ];

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4", 
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4"
  };

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
    setStep("form");
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const feedbackData = {
        rating,
        comment: feedback.trim(),
        email: email.trim() || undefined,
        timestamp: new Date().toISOString(),
        source: "embedded-widget"
      };

      await saveFeedbackOffline(feedbackData);
      syncPendingFeedback();
      
      setStep("thanks");
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setStep("rating");
        setRating(0);
        setFeedback("");
        setEmail("");
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, feedback, email]);

  const handleClose = () => {
    setIsOpen(false);
    setStep("rating");
    setRating(0);
    setFeedback("");
    setEmail("");
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 font-sans`}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl border p-6 w-80 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {step === "thanks" ? "Thank you!" : `Feedback for ${companyName}`}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Rating Step */}
          {step === "rating" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">How was your experience?</p>
              <div className="flex justify-between">
                {emojis.map((item) => (
                  <button
                    key={item.rating}
                    onClick={() => handleRatingSelect(item.rating)}
                    className="text-2xl hover:scale-110 transition-transform p-1 rounded"
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Step */}
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{emojis[rating - 1]?.emoji}</span>
                <span className="text-sm text-gray-600">Rating: {rating}/5</span>
              </div>
              
              <div>
                <Textarea
                  placeholder="Tell us more about your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
              
              <div>
                <Input
                  type="email"
                  placeholder="Your email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("rating")}
                  className="flex-1 text-sm"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Thanks Step */}
          {step === "thanks" && (
            <div className="text-center space-y-3">
              <div className="text-4xl">🎉</div>
              <p className="text-sm text-gray-600">
                Thank you for your feedback! It helps us improve our service.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmbeddableFeedback;