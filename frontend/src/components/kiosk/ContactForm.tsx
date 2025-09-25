import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactFormProps {
  rating: number;
  onSubmit: (data: ContactFormData) => void;
  onSkip: () => void;
}

export interface ContactFormData {
  rating: number;
  name?: string;
  email?: string;
  phone?: string;
  profession?: string;
  comment?: string;
  timestamp: string;
}

const professionOptions = [
  "Patient",
  "Customer", 
  "Consultant",
  "Visitor",
  "Other"
];

const ContactForm = ({ rating, onSubmit, onSkip }: ContactFormProps) => {
  const [formData, setFormData] = useState<Partial<ContactFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData: ContactFormData = {
      rating,
      name: formData.name?.trim(),
      email: formData.email?.trim(),
      phone: formData.phone?.trim(),
      profession: formData.profession,
      comment: formData.comment?.trim(),
      timestamp: new Date().toISOString(),
    };

    // Remove empty fields
    Object.keys(submitData).forEach(key => {
      if (submitData[key as keyof ContactFormData] === "" || 
          submitData[key as keyof ContactFormData] === undefined) {
        delete submitData[key as keyof ContactFormData];
      }
    });

    onSubmit(submitData);
  };

  return (
    <div className="kiosk-container items-center justify-start px-4 py-6 lg:px-8 lg:py-12">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-12">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 lg:mb-4">
            Thanks for your feedback!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Want us to follow up? Fill out the optional fields below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-foreground">
                    Name (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="kiosk-input"
                    maxLength={50}
                  />
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-foreground">
                    Email (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="kiosk-input"
                    maxLength={100}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-foreground">
                    Phone (Optional)
                  </label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="kiosk-input"
                    maxLength={20}
                  />
                </div>

                {/* Profession */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-foreground">
                    Visit Reason (Optional)
                  </label>
                  <Select 
                    value={formData.profession || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, profession: value }))}
                  >
                    <SelectTrigger className="kiosk-input">
                      <SelectValue placeholder="Select your visit reason" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {professionOptions.map((option) => (
                        <SelectItem key={option} value={option} className="text-lg py-3">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Column - Comments */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-foreground">
                Additional Comments (Optional)
              </label>
              <Textarea
                placeholder="Tell us more about your experience..."
                value={formData.comment || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                className="kiosk-input min-h-[200px] lg:min-h-[280px] resize-none"
                maxLength={200}
              />
              <div className="text-sm text-muted-foreground text-right">
                {(formData.comment || "").length}/200 characters
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6 pt-4 lg:pt-8 sticky bottom-0 bg-background pb-4 lg:pb-0">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="kiosk-button-primary flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
            
            <Button
              type="button"
              onClick={onSkip}
              className="kiosk-button-secondary flex-1"
            >
              Skip & Exit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;