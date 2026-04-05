import { loadOnboarding, type OnboardingData } from "@/pages/OnboardingPage";

type InsightInput = {
  mood: string;
  alignmentScore: number;
  hasIntention: boolean;
};

type Insight = {
  acknowledgment: string;
  message: string;
  reinforcement?: string;
};

/**
 * Deterministic pick based on a simple string hash — same inputs always
 * produce the same output. No Math.random().
 */
function stableIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

function pick<T>(arr: T[], seed: string): T {
  return arr[stableIndex(seed, arr.length)];
}

/**
 * Add onboarding-aware flavour to the insight message.
 * Returns an extra sentence or empty string.
 */
function contextLine(onboarding: OnboardingData | null, mood: string): string {
  if (!onboarding) return "";

  const identities = [
    ...onboarding.selectedIdentities,
    ...(onboarding.customIdentity?.trim() ? [onboarding.customIdentity.trim()] : []),
  ].map((s) => s.toLowerCase());

  const focus = onboarding.priority?.toLowerCase() ?? "";

  // Identity-based lines
  if (identities.some((i) => i.includes("disciplin") || i.includes("consistent"))) {
    return " Your consistency is your edge — today proved it.";
  }
  if (identities.some((i) => i.includes("calm") || i.includes("peace") || i.includes("control"))) {
    return " Staying centered, even briefly, is the practice you chose.";
  }
  if (identities.some((i) => i.includes("purpose") || i.includes("driven"))) {
    return " Purpose isn't found — it's built in moments like this.";
  }
  if (identities.some((i) => i.includes("health") || i.includes("energi"))) {
    return " Taking care of yourself today is an investment in every tomorrow.";
  }

  // Focus-based lines
  if (focus === "relationships") {
    return " Connection grows when you show up — for others and yourself.";
  }
  if (focus === "health") {
    return " Your body keeps the score. Today you moved in the right direction.";
  }
  if (focus === "wealth") {
    return " Every aligned day compounds — financially and personally.";
  }
  if (focus === "purpose") {
    return " Clarity comes from doing, not waiting. You did something today.";
  }

  return "";
}

export function generateInsight({ mood, alignmentScore, hasIntention }: InsightInput): Insight {
  const onboarding = loadOnboarding();
  const isLowMood = ["😤 Frustrated", "😔 Low"].includes(mood);
  const isHighMood = ["⚡ Energized", "😌 Calm"].includes(mood);
  const isHighAlignment = alignmentScore >= 7;
  const isLowAlignment = alignmentScore <= 4;

  // Deterministic seed from today's inputs
  const seed = `${mood}-${alignmentScore}-${hasIntention}-${new Date().toISOString().slice(0, 10)}`;
  const extra = contextLine(onboarding, mood);

  // Acknowledgment — always present, deterministic
  const acknowledgments = [
    "You showed up today.",
    "You paused long enough to check in.",
    "That took intention.",
    "You're here. That matters.",
  ];

  // Low mood + wrote something → acknowledge strength
  if (isLowMood && hasIntention) {
    return {
      acknowledgment: pick(acknowledgments, seed),
      message: pick([
        "Tough days don't erase your direction. The fact that you reflected on it says more than you think.",
        "Even on hard days, you found something that mattered. That's not small — that's rare.",
        "Feeling low and still showing up is quiet courage. You're closer than it feels.",
      ], seed) + extra,
      reinforcement: pick([
        "Tomorrow doesn't need to be perfect. Just intentional.",
        "Rest is part of the work.",
      ], seed + "r"),
    };
  }

  // Low mood + no intention → gentle, no judgment
  if (isLowMood) {
    return {
      acknowledgment: pick(acknowledgments, seed),
      message: pick([
        "Some days, checking in is the whole accomplishment. This is one of those days — and that's enough.",
        "You don't need to have it figured out today. Being honest about where you are is the first step.",
      ], seed) + extra,
      reinforcement: "Tomorrow is a clean page.",
    };
  }

  // Low alignment → gentle reflection
  if (isLowAlignment) {
    return {
      acknowledgment: pick(acknowledgments, seed),
      message: pick([
        "Off-track days are part of the process, not a sign you've failed. Noticing it is already a correction.",
        "You noticed the gap between where you are and where you want to be. Most people never pause long enough to see it.",
      ], seed) + extra,
      reinforcement: hasIntention
        ? "You named what mattered. That's your compass for tomorrow."
        : "Tomorrow, try naming one small thing that matters.",
    };
  }

  // High alignment + high mood → reinforce momentum
  if (isHighAlignment && isHighMood) {
    return {
      acknowledgment: pick([
        "You're in rhythm today.",
        "Something clicked today.",
        "You showed up — fully.",
      ], seed),
      message: pick([
        "When your mood and your actions are aligned, you're not just productive — you're becoming who you said you'd be.",
        "Days like this build the foundation. Not because they're perfect, but because they're intentional.",
      ], seed) + extra,
      reinforcement: pick([
        "Keep this feeling close. It's proof of what's possible.",
        "This is what aligned living feels like.",
      ], seed + "r"),
    };
  }

  // High alignment → reinforce
  if (isHighAlignment) {
    return {
      acknowledgment: pick(acknowledgments, seed),
      message: pick([
        "You're moving in the direction you chose. That consistency is building something you can't see yet.",
        "Alignment isn't about perfection — it's about returning to your intention. You did that today.",
      ], seed) + extra,
      reinforcement: hasIntention
        ? "What you wrote today is a thread. Follow it tomorrow."
        : undefined,
    };
  }

  // High mood, moderate alignment → encourage continuation
  if (isHighMood) {
    return {
      acknowledgment: pick(acknowledgments, seed),
      message: pick([
        "You're feeling good — channel that energy. A clear mood is a chance to take one meaningful step.",
        "Energy is a resource. You have it right now. Even one small move in the right direction compounds.",
      ], seed) + extra,
      reinforcement: "Ride this momentum into tomorrow.",
    };
  }

  // Default / neutral
  return {
    acknowledgment: pick(acknowledgments, seed),
    message: (hasIntention
      ? "You named something that mattered today. That's more than most people do. Let that sit with you."
      : "Checking in, even on neutral days, keeps you connected to your direction. That's the practice.") + extra,
    reinforcement: "See you tomorrow.",
  };
}
