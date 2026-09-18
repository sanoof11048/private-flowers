export interface FlowerCard {
  id: string;
  name: string;
  botanicalName: string;
  tagline: string;
  description: string;
  symbolism: string;
  imageUrl: string;
  accentColor: string;
}

export interface InteractiveFlower {
  id: string;
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
  message: string;
  flowerType: "rose" | "tulip" | "babys-breath" | "peony" | "hydrangea";
  imageUrl: string;
}

export const ROMANTIC_CONFIG = {
  recipient: {
    fullName: "Lena Fathima K",
    shortName: "Lena",
  },
  sender: {
    name: "Sanoof",
    signoff: "With love,",
  },
  hero: {
    preTitle: "A little something made just for you",
    title: "For Lena Fathima K",
    subtitle: "A digital bouquet that never fades, blossoming especially for you.",
    ctaButton: "Open Your Bouquet 🌷",
    bouquetImage:
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=85",
    bouquetAlt: "Fresh romantic bouquet of pink roses, delicate tulips, baby's breath, and soft greenery",
  },
  mainMessage: {
    heading: "Lena, this is for you.",
    paragraphs: [
      "I wanted to give you something beautiful, something that would make you smile, and something you could keep coming back to.",
      "So instead of just giving you flowers, I made you a little place filled with them.",
    ],
    noteSubtext: "Made with care, kept forever in full bloom.",
  },
  gallery: {
    sectionTitle: "Flowers for You",
    sectionSubtitle: "Every petal carries a feeling, selected with gentle care.",
    flowers: [
      {
        id: "rose",
        name: "Rose",
        botanicalName: "Rosa",
        tagline: "Because some feelings are timeless.",
        description:
          "Known for its velvety petals and enduring beauty. A classic reminder of love that deepens with every passing day.",
        symbolism: "Timeless affection & grace",
        imageUrl:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=85",
        accentColor: "#F48FB1",
      },
      {
        id: "tulip",
        name: "Tulip",
        botanicalName: "Tulipa",
        tagline: "Simple, beautiful, and impossible not to notice.",
        description:
          "Unfolding with pure grace and natural charm. It represents fresh beginnings and effortless elegance.",
        symbolism: "Natural charm & sincere joy",
        imageUrl:
          "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1000&q=85",
        accentColor: "#FFAB91",
      },
      {
        id: "babys-breath",
        name: "Baby's Breath",
        botanicalName: "Gypsophila",
        tagline: "For all the little moments that make everything special.",
        description:
          "Delicate white clouds of tiny blossoms that bring balance and lightness to every bouquet.",
        symbolism: "Pure warmth & cherished moments",
        imageUrl:
          "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1000&q=85",
        accentColor: "#E0E0E0",
      },
      {
        id: "peony",
        name: "Peony",
        botanicalName: "Paeonia",
        tagline: "Gentle, graceful, and full of warmth.",
        description:
          "With lush, layered petals that bloom into breathtaking fullness, embodying happiness and tender care.",
        symbolism: "Prosperity & gentle romance",
        imageUrl:
          "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=85",
        accentColor: "#F8BBD0",
      },
      {
        id: "hydrangea",
        name: "Hydrangea",
        botanicalName: "Hydrangea macrophylla",
        tagline: "A cluster of gratitude and deep appreciation.",
        description:
          "Scores of tender florets gathered together into a single harmonious bloom of softness.",
        symbolism: "Heartfelt gratitude & devotion",
        imageUrl:
          "https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=1000&q=85",
        accentColor: "#CE93D8",
      },
      {
        id: "white-camellia",
        name: "White Blossom",
        botanicalName: "Camellia japonica",
        tagline: "A quiet glow of serenity and quiet beauty.",
        description:
          "Soft, pristine petals that bring peace, reminding us how calming the presence of someone special can be.",
        symbolism: "Serenity & admiration",
        imageUrl:
          "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1000&q=85",
        accentColor: "#FFF3E0",
      },
    ] as FlowerCard[],
  },
  interactiveBouquet: {
    sectionTitle: "Tap a Blossom in the Bouquet",
    sectionSubtitle:
      "Touch any flower in the arrangement below to reveal a secret note written for you.",
    bouquetImage:
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=85",
    flowers: [
      {
        id: "ib-1",
        name: "Velvet Rose",
        x: 34,
        y: 36,
        message: "You make ordinary days feel special.",
        flowerType: "rose",
        imageUrl:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "ib-2",
        name: "Blush Peony",
        x: 58,
        y: 28,
        message: "You deserve beautiful things.",
        flowerType: "peony",
        imageUrl:
          "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "ib-3",
        name: "Baby's Breath",
        x: 22,
        y: 52,
        message: "Just a little reminder that you're loved.",
        flowerType: "babys-breath",
        imageUrl:
          "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "ib-4",
        name: "Sweet Tulip",
        x: 68,
        y: 54,
        message: "Keep smiling, Lena.",
        flowerType: "tulip",
        imageUrl:
          "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "ib-5",
        name: "Center Bloom",
        x: 48,
        y: 50,
        message: "Every moment with you is a gentle gift.",
        flowerType: "rose",
        imageUrl:
          "https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=400&q=80",
      },
    ] as InteractiveFlower[],
  },
  finalMessage: {
    heading: "One more thing...",
    body: "Lena Fathima K,\nif I could give you every flower in the world,\nI'd still feel like it wasn't enough.\n\nSo here's a little bouquet made just for you. ❤️",
    bouquetImage:
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=1200&q=85",
    signoff: "With love,\nSanoof",
  },
};
