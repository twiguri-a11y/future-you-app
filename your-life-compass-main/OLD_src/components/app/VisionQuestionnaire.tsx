import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Upload, X, Dog, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const questions = [
  { key: "location", label: "Where do you live in your future?", placeholder: "A quiet coastal town, a vibrant city, surrounded by nature…" },
  { key: "home", label: "What does your home look like?", placeholder: "Warm light, minimal design, books everywhere, a garden…" },
  { key: "moment", label: "Describe a specific moment in your day.", placeholder: "Morning coffee on the balcony, watching the sunset, cooking dinner…" },
  { key: "activity", label: "What are you doing in that moment?", placeholder: "Reading, working on something meaningful, playing with my kids…" },
  { key: "people", label: "Who is with you?", placeholder: "My partner, my family, a close friend, or just me…" },
  { key: "relationships", label: "What kind of relationships surround you?", placeholder: "Deep, honest, supportive, joyful, calm…" },
  { key: "feeling", label: "How do you feel in this moment?", placeholder: "Calm, powerful, fulfilled, free, at peace…" },
  { key: "becoming", label: "What kind of person are you becoming?", placeholder: "Patient, present, confident, creative, grounded…" },
];

const companionOptions = [
  { key: "partner", label: "Partner", icon: Heart },
  { key: "family", label: "Family", icon: Users },
  { key: "pet", label: "Pet", icon: Dog },
];

interface Props {
  onComplete: (answers: Record<string, string>, petImage?: string | null) => void;
}

const VisionQuestionnaire = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showCompanion, setShowCompanion] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);
  const [petImageData, setPetImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = questions.length + 1; // +1 for companion question
  const isCompanionStep = step === questions.length;
  const current = !isCompanionStep ? questions[step] : null;
  const value = current ? answers[current.key] || "" : "";
  const isLast = isCompanionStep;
  const canProceed = isCompanionStep
    ? true // companion is optional
    : value.trim().length >= 3;

  const next = () => {
    if (isLast) {
      onComplete(answers, selectedCompanion === "pet" ? petImageData : null);
    } else if (canProceed) {
      setStep((s) => s + 1);
    }
  };

  const handlePetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return; // 5MB max
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPetImageData(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePetImage = () => {
    setPetImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-[60vh] flex flex-col justify-center">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {step + 1} of {totalSteps}
          </p>

          {isCompanionStep ? (
            <div>
              <h2 className="text-xl font-bold mb-2 leading-snug">
                Do you want to include someone important in your future?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Optional — skip if you'd like</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {companionOptions.map((opt) => {
                  const isSelected = selectedCompanion === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedCompanion(isSelected ? null : opt.key)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <opt.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Pet upload section */}
              {selectedCompanion === "pet" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a photo of your pet to include them in your vision
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePetUpload}
                    className="hidden"
                  />

                  {petImageData ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-primary/30">
                      <img src={petImageData} alt="Your pet" className="w-full h-full object-cover" />
                      <button
                        onClick={removePetImage}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/70 text-background flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-medium">Upload</span>
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-6 leading-snug">{current!.label}</h2>
              <Textarea
                value={value}
                onChange={(e) => setAnswers((a) => ({ ...a, [current!.key]: e.target.value }))}
                placeholder={current!.placeholder}
                className="min-h-[120px] text-base bg-card border-border resize-none focus:ring-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    next();
                  }
                }}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <Button
          variant="hero"
          className="flex-1 gap-1.5"
          onClick={next}
          disabled={!canProceed}
        >
          {isLast ? "Generate My Vision" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VisionQuestionnaire;
