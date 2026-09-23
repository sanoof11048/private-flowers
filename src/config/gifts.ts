export interface GiftItem {
  id: string;
  icon: string;
  badge: string;
  title: string;
  subtitle: string;
  type: "product" | "image" | "gif" | "video" | "message" | "tenor";
  src?: string;
  postId?: string;
  aspectRatio?: string;
  tenorUrl?: string;
  tenorLinkText?: string;
  punchline: string;
  subtext?: string;
  secretSteps?: string[];
}

export const GIFTS_CONFIG: GiftItem[] = [
  {
    id: "gift-sweet",
    icon: "🍫",
    badge: "Sweet",
    title: "Something sweet",
    subtitle: "A classic essential",
    type: "product",
    src: "/gifts/kinder-joy.png",
    punchline: "Okay fine... this one is actually edible 😂",
    subtext: "Don't say I never give you anything.",
  },
  {
    id: "gift-cat",
    icon: "🐱",
    badge: "Cat Attack",
    title: "Cat Attack",
    subtitle: "Okay... this one is for you 😂",
    type: "tenor",
    postId: "12553196888763818675",
    aspectRatio: "1",
    tenorUrl: "https://tenor.com/view/cat-cute-neko-kitty-kiss-gif-12553196888763818675",
    tenorLinkText: "Cat Cute Sticker",
    punchline: "Don't ask questions. 😂",
    subtext: "Peak best-friend delivery.",
  },
  {
    id: "gift-risk",
    icon: "😂",
    badge: "Risk",
    title: "Open at your own risk",
    subtitle: "High chance of regret",
    type: "gif",
    src: "/gifts/funny.gif",
    punchline: "I told you not to click it 💀",
    subtext: "You really thought it was something serious?",
  },
  {
    id: "gift-surprise",
    icon: "📸",
    badge: "Surprise",
    title: "A random surprise",
    subtitle: "Certified moment",
    type: "image",
    src: "/gifts/surprise.jpg",
    punchline: "Look at this distinguished gentleman 🍉😎",
    subtext: "Certified best-friend energy.",
  },
  {
    id: "gift-video",
    icon: "🎬",
    badge: "Video",
    title: "Watch this",
    subtitle: "Click to play",
    type: "video",
    src: "/gifts/video.mp4",
    punchline: "Peak cinema right here 🍿",
    subtext: "Oscar-worthy performance.",
  },
  {
    id: "gift-meme",
    icon: "💀",
    badge: "Important",
    title: "This one is important",
    subtitle: "Life-changing update",
    type: "image",
    src: "/gifts/surprise.jpg",
    punchline: "Most crucial discovery of 2026 😂",
    subtext: "You are very welcome.",
  },
  {
    id: "gift-secret",
    icon: "👀",
    badge: "Top Secret",
    title: "Secret",
    subtitle: "Classified files",
    type: "message",
    punchline: "😂",
    secretSteps: [
      "Okay... you got everything.",
      "Except one thing.",
      "😂",
    ],
  },
];
