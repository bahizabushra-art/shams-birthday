export interface WishEnergyConfig {
  id: string;
  name: string;
  defaultPrompt: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
}

export interface StarTypeConfig {
  id: string;
  name: string;
  label: string;
  symbol: string;
  meaning: string;
  gradient: string;
  glowHex: string;
  tailwindBorder: string;
}

export interface AppConfig {
  recipientName: string;
  birthDate: string; // 2025-09-30
  birthdayDate: string; // 2026-09-30
  age: number;
  siteTitle: string;
  siteSubtitle: string;
  hero: {
    badge: string;
    greeting: string;
    leadOne: string;
    leadTwo: string;
    primaryCta: string;
    secondaryCta: string;
  };
  countdown: {
    heading: string;
    todayMessage: string;
    upcomingSubtitle: string;
  };
  milestones: {
    heading: string;
    subtitle: string;
    cards: Array<{
      tag: string;
      title: string;
      description: string;
      icon: string;
    }>;
  };
  footer: {
    signature: string;
    tagline: string;
  };
  wishLimit: number;
  availableEnergies: WishEnergyConfig[];
  availableStarTypes: StarTypeConfig[];
}

export const appConfig: AppConfig = {
  recipientName: "Shams Moni",
  birthDate: "2025-09-30",
  birthdayDate: "2026-09-30",
  age: 1,
  siteTitle: "Baby Shams's 1st Birthday Universe",
  siteSubtitle: "One whole year of giggles, tiny steps, and infinite love. Send your heartfelt blessings for Shams's first orbit around the sun! ☀️",
  hero: {
    badge: "🍼 Turning 1 Year Old Today! • Born 30 September 2025",
    greeting: "Happy 1st Birthday,\nBaby Shams Moni! 🎈",
    leadOne: "Our little sunshine has completed his very first trip around the sun.",
    leadTwo: "365 days of sweet smiles, tiny giggles, and pure joy.",
    primaryCta: "Leave a Blessing for Shams 💫",
    secondaryCta: "See All Wishes",
  },
  countdown: {
    heading: "Shams’s Big 1st Birthday Milestone!",
    todayMessage: "Today is Shams’s 1st Birthday! 🎂🎈✨",
    upcomingSubtitle: "Counting down to Shams's 1st Birthday celebration",
  },
  milestones: {
    heading: "365 Days of Sweet Baby Shams",
    subtitle: "A look back at the sweetest first year of life.",
    cards: [
      {
        tag: "Milestone 1",
        title: "First Giggles & Grins",
        description: "The sweetest baby laughs, joyful babbling, and pure toothless smiles that light up every morning.",
        icon: "smile",
      },
      {
        tag: "Milestone 2",
        title: "Tiny Hands & Curious Steps",
        description: "Clapping hands, crawling around, holding fingers tight, and exploring this big wide world with curiosity.",
        icon: "baby",
      },
      {
        tag: "Milestone 3",
        title: "Our Bright Little Sunshine",
        description: "A year of warmth, warm cuddles, playful moments, and bringing pure happiness to family and friends.",
        icon: "sun",
      },
    ],
  },
  footer: {
    signature: "Made with love for Baby Shams Moni on his 1st Birthday 🎂",
    tagline: "May every wish guide our little prince as he grows.",
  },
  wishLimit: 500,
  availableEnergies: [
    {
      id: "health",
      name: "Health & Protection",
      defaultPrompt: "May you always grow up healthy, strong, and safe in every step.",
      color: "from-emerald-400 to-teal-500",
      badgeBg: "bg-emerald-500/15 border-emerald-400/30",
      badgeText: "text-emerald-300",
      glowColor: "rgba(16, 185, 129, 0.4)",
    },
    {
      id: "joy",
      name: "Giggles & Joy",
      defaultPrompt: "May your days be full of sweet laughter, fun toys, and endless play.",
      color: "from-amber-400 to-yellow-500",
      badgeBg: "bg-amber-500/15 border-amber-400/30",
      badgeText: "text-amber-300",
      glowColor: "rgba(245, 158, 11, 0.4)",
    },
    {
      id: "bright_future",
      name: "Bright Future",
      defaultPrompt: "May life open gentle, wonderful doors for you as you grow.",
      color: "from-sky-400 to-blue-500",
      badgeBg: "bg-sky-500/15 border-sky-400/30",
      badgeText: "text-sky-300",
      glowColor: "rgba(14, 165, 233, 0.4)",
    },
    {
      id: "peace",
      name: "Sweet Peace",
      defaultPrompt: "May you always have peaceful nights, sweet dreams, and gentle mornings.",
      color: "from-indigo-400 to-purple-400",
      badgeBg: "bg-indigo-500/15 border-indigo-400/30",
      badgeText: "text-indigo-300",
      glowColor: "rgba(99, 102, 241, 0.4)",
    },
    {
      id: "love",
      name: "Endless Love",
      defaultPrompt: "May you always know how deeply loved and cherished you are by everyone.",
      color: "from-rose-400 to-pink-500",
      badgeBg: "bg-rose-500/15 border-rose-400/30",
      badgeText: "text-rose-300",
      glowColor: "rgba(244, 63, 94, 0.4)",
    },
    {
      id: "wonder",
      name: "Big Wonder",
      defaultPrompt: "May you explore the world with brave curiosity and a kind, gentle heart.",
      color: "from-purple-400 to-fuchsia-400",
      badgeBg: "bg-purple-500/15 border-purple-400/30",
      badgeText: "text-purple-300",
      glowColor: "rgba(168, 85, 247, 0.4)",
    },
  ],
  availableStarTypes: [
    {
      id: "golden_star",
      name: "Little Sunshine Star",
      label: "Sunshine Star",
      symbol: "☀️",
      meaning: "Warmth & Smiles",
      gradient: "from-amber-300 via-yellow-400 to-amber-500",
      glowHex: "#f59e0b",
      tailwindBorder: "border-amber-400/40",
    },
    {
      id: "moon",
      name: "Gentle Moon",
      label: "Sleepy Moon",
      symbol: "🌙",
      meaning: "Sweet Dreams",
      gradient: "from-indigo-200 via-sky-300 to-blue-400",
      glowHex: "#818cf8",
      tailwindBorder: "border-indigo-400/40",
    },
    {
      id: "teddy",
      name: "Teddy Bear Star",
      label: "Teddy Hug",
      symbol: "🧸",
      meaning: "Hugs & Comfort",
      gradient: "from-amber-400 via-orange-400 to-amber-600",
      glowHex: "#ea580c",
      tailwindBorder: "border-amber-400/40",
    },
    {
      id: "balloon",
      name: "Birthday Balloon",
      label: "Party Balloon",
      symbol: "🎈",
      meaning: "1st Birthday Fun",
      gradient: "from-rose-400 via-pink-400 to-red-400",
      glowHex: "#f43f5e",
      tailwindBorder: "border-rose-400/40",
    },
    {
      id: "blossom",
      name: "Baby Blossom",
      label: "Little Blossom",
      symbol: "🌸",
      meaning: "Growing Strong",
      gradient: "from-pink-300 via-rose-300 to-purple-300",
      glowHex: "#f472b6",
      tailwindBorder: "border-pink-400/40",
    },
    {
      id: "astronaut",
      name: "Tiny Astronaut",
      label: "1st Orbit",
      symbol: "🚀",
      meaning: "First Trip Round Sun",
      gradient: "from-cyan-300 via-sky-400 to-indigo-500",
      glowHex: "#38bdf8",
      tailwindBorder: "border-cyan-400/40",
    },
  ],
};
