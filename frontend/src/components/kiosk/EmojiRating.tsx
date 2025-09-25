import { useState } from "react";

interface EmojiRatingProps {
  onRatingSelect: (rating: number) => void;
}

const emojis = [
  { emoji: "😞", label: "Very Dissatisfied", rating: 1, className: "emoji-very-sad" },
  { emoji: "😕", label: "Dissatisfied", rating: 2, className: "emoji-sad" },
  { emoji: "😐", label: "Neutral", rating: 3, className: "emoji-neutral" },
  { emoji: "😊", label: "Satisfied", rating: 4, className: "emoji-happy" },
  { emoji: "😄", label: "Very Satisfied", rating: 5, className: "emoji-very-happy" },
];

const EmojiRating = ({ onRatingSelect }: EmojiRatingProps) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleEmojiClick = (rating: number) => {
    setSelectedRating(rating);
    
    // Add a brief visual feedback before proceeding
    setTimeout(() => {
      onRatingSelect(rating);
    }, 200);
  };

  return (
    <div className="kiosk-container items-center justify-center px-8 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            How was your experience?
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your feedback helps us improve our service
          </p>
        </div>

        {/* Emoji Rating Grid */}
        <div className="grid grid-cols-5 max-md:grid-cols-1 gap-8 max-md:gap-4 max-w-5xl max-md:max-w-sm mx-auto">
          {emojis.map((item) => (
            <button
              key={item.rating}
              onClick={() => handleEmojiClick(item.rating)}
              className={`
                emoji-button ${item.className} 
                flex flex-col items-center justify-center space-y-4 p-8
                ${selectedRating === item.rating ? "ring-4 ring-primary ring-offset-4" : ""}
              `}
              aria-label={`Rate ${item.rating} out of 5: ${item.label}`}
            >
              <span className="text-6xl md:text-7xl">{item.emoji}</span>
              <span className="text-lg md:text-xl font-semibold text-foreground">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-xl text-muted-foreground">
          Tap an emoji above to continue
        </div>
      </div>
    </div>
  );
};

export default EmojiRating;