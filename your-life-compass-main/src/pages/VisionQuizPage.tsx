import { useState } from "react";
import Results from "../Results.jsx";

const MOODS = ["Happy", "Calm", "Focused", "Energized"];
const GOALS = ["Confident", "Ambitious", "Compassionate", "Purposeful"];

/** Standalone vision quiz → Results. Routed at /quiz */
const VisionQuizPage = () => {
  const [finished, setFinished] = useState(false);
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState("");
  const [goal, setGoal] = useState("");

  const finishQuiz = () => setFinished(true);

  if (finished) {
    return <Results mood={mood} goal={goal} />;
  }

  const isMoodStep = step === 0;
  const title = isMoodStep ? "How do you want to feel?" : "What kind of leader are you becoming?";
  const options = isMoodStep ? MOODS : GOALS;
  const selected = isMoodStep ? mood : goal;
  const setSelected = isMoodStep ? setMood : setGoal;
  const canContinue = selected.length > 0;

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-[#F28C28] p-8">
        <p className="text-center text-sm font-semibold text-[#F28C28] uppercase tracking-widest mb-2">
          Quick vision quiz {step + 1} / 2
        </p>
        <h1 className="text-center text-2xl font-bold text-[#1A2B3C] mb-6">{title}</h1>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {options.map((opt) => {
            const active = selected === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSelected(opt)}
                className={`rounded-xl py-3 px-2 text-sm font-semibold transition-colors border-2 ${
                  active
                    ? "bg-[#1A2B3C] text-white border-[#1A2B3C]"
                    : "bg-[#f7f7f7] text-[#1A2B3C] border-transparent hover:border-[#F28C28]/50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              className="flex-1 py-4 rounded-lg font-bold border-2 border-[#1A2B3C]/20 text-[#1A2B3C] hover:bg-gray-50"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </button>
          )}
          <button
            type="button"
            disabled={!canContinue}
            className="flex-1 bg-[#1A2B3C] hover:bg-[#152433] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors"
            onClick={() => {
              if (isMoodStep) setStep(1);
              else finishQuiz();
            }}
          >
            {isMoodStep ? "Next" : "See my vision"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisionQuizPage;
