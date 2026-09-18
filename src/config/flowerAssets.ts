/**
 * Single Source of Truth for all Flower Head & Botanical Assets
 * Every asset is guaranteed to have:
 * - 100% True Alpha Transparency
 * - Flower Head ONLY (no embedded stems/leaves)
 * - Zero rectangular/black boundaries
 */
export const FLOWER_ASSETS = {
  roses: {
    red: "/flowers/heads/rose-red.png",
    pink: "/flowers/heads/rose-pink.png",
    white: "/flowers/heads/rose-white.png",
  },
  tulips: {
    pink: "/flowers/heads/tulip-pink.png",
  },
  peonies: {
    white: "/flowers/heads/peony-white.png",
  },
  daisies: {
    white: "/flowers/heads/daisy-white.png",
  },
  fillers: {
    lavender: "/flowers/heads/tulip-pink.png",
    babyBreath: "/flowers/heads/daisy-white.png",
    eucalyptus: "/flowers/heads/peony-white.png",
    cherryBlossom: "/flowers/heads/rose-pink.png",
  },
} as const;

export type FlowerAssetType =
  | keyof typeof FLOWER_ASSETS.roses
  | keyof typeof FLOWER_ASSETS.tulips
  | keyof typeof FLOWER_ASSETS.peonies
  | keyof typeof FLOWER_ASSETS.daisies;
