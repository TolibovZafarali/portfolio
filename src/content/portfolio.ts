export type SceneId = "top" | "work" | "about" | "contact";

export interface NavigationItem {
  readonly id: SceneId;
  readonly label: string;
}

export interface Project {
  readonly id: "venfour" | "imposter";
  readonly index: string;
  readonly name: string;
  readonly category: string;
  readonly headline: string;
  readonly description: string;
  readonly stack: readonly string[];
  readonly url: string;
  readonly linkLabel: string;
  readonly repository: string;
  readonly details: readonly { title: string; description: string }[];
}

export const portfolioContent = {
  name: "Zafarali Tolibov",
  email: "zafaralit67@gmail.com",
  github: "https://github.com/TolibovZafarali",
  linkedin: "https://linkedin.com/in/zafarali-tolibov",
  projects: [
    {
      id: "venfour",
      index: "01",
      name: "Venfour",
      category: "WEB APPLICATION · VEHICLE VALUATION",
      headline: "Clarity when it\nmatters most.",
      description: "Turning insurance reports and market evidence into clear, organized findings. An independent vehicle-valuation platform built to help people understand the numbers behind their claim.",
      stack: ["React", "TypeScript", "Python", "Supabase", "Cloudflare"],
      url: "https://venfour.com",
      linkLabel: "Explore Venfour",
      repository: "https://github.com/TolibovZafarali/venfour",
      details: [
        { title: "From document to evidence", description: "Extract the details from valuation reports, research comparable vehicles, and bring discrepancies into focus." },
        { title: "A case that stays organized", description: "Keep supporting documents, saved analysis, and a reproducible history together in one private workspace." },
        { title: "Built from end to end", description: "A React interface, Python analysis services, Supabase data layer, and Cloudflare delivery." },
      ],
    },
    {
      id: "imposter",
      index: "02",
      name: "Imposter: All Languages",
      category: "iOS APPLICATION · SOCIAL DEDUCTION",
      headline: "Different languages.\nSame suspicion.",
      description: "One phone. A room full of friends. Someone is bluffing. A party game that lets each player choose their own language, so everyone can be in on the fun.",
      stack: ["React Native", "Expo", "TypeScript", "Supabase", "Reanimated"],
      url: "https://apps.apple.com/us/app/imposter-all-languages/id6771144493",
      linkLabel: "View on the App Store",
      repository: "https://github.com/TolibovZafarali/imposter",
      details: [
        { title: "One phone, everyone plays", description: "Pass the phone for private role reveals, share clues, debate, and vote to uncover the imposter." },
        { title: "Your language. Your game.", description: "133 selectable gameplay languages, with individual language choices in the same round. The app interface is in English." },
        { title: "Made for another round", description: "Topic categories, an optional discussion timer, voting, and a final reveal keep the game moving." },
      ],
    },
  ] satisfies readonly [Project, Project],
  navigation: [
    { id: "work", label: "Work" },
    { id: "about", label: "Approach" },
    { id: "contact", label: "Connect" },
  ] satisfies readonly NavigationItem[],
} as const;
