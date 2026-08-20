import type { Direction, Format } from "./types";

export const FORMATS: Format[] = [
  { id: "full-page", name: "Main / Jacket", subtitle: "Header + 329 × 450 mm ad", ratio: 329 / 525, badge: "ENABLED", shape: "wrap" },
  { id: "lband", name: "L-Band", subtitle: "155 mm right leg + 329 × 155 mm bottom", ratio: 329 / 525, shape: "l" },
  { id: "french-window", name: "French Window", subtitle: "658 × 525 mm double-page spread", ratio: 658 / 525, badge: "PREMIUM", shape: "window" },
  { id: "edit-wrap", name: "Edit Wrap", subtitle: "Editorial surround", ratio: 329 / 525, shape: "frame" },
  { id: "half-page", name: "Half Page", subtitle: "Editorial top + 329 × 250 mm ad", ratio: 329 / 525, shape: "half" },
  { id: "island", name: "Island", subtitle: "180 × 220 mm centered ad", ratio: 329 / 525, shape: "island" },
  { id: "skyline", name: "Skyline", subtitle: "329 × 110 mm top banner", ratio: 329 / 525, shape: "sky" },
  { id: "bookmark", name: "Bookmark", subtitle: "90 × 525 mm vertical strip", ratio: 329 / 525, shape: "strip" },
];

export const DIRECTIONS: Direction[] = [
  { id: "quiet-luxury", name: "Quiet Luxury", mood: "Elegant · Restrained", palette: ["#0f2b25", "#d8c8a4", "#f4efe3"], description: "Editorial restraint, tactile light and confident whitespace." },
  { id: "kinetic-type", name: "Kinetic Type", mood: "Bold · Graphic", palette: ["#f4b942", "#0c0c0d", "#f2eee6"], description: "Oversized typography and geometric energy built for stopping power." },
  { id: "product-theatre", name: "Product Theatre", mood: "Cinematic · Rich", palette: ["#4b1f1a", "#f0b58f", "#111111"], description: "Dramatic lighting turns the product into the hero." },
  { id: "fresh-air", name: "Fresh Air", mood: "Bright · Human", palette: ["#dbe9e0", "#ef7555", "#18332b"], description: "Natural color, daylight and an optimistic human touch." },
  { id: "paper-cut", name: "Paper Cut", mood: "Crafted · Playful", palette: ["#275f77", "#f4d35e", "#ee6c4d"], description: "Layered paper forms with a distinctly print-native character." },
  { id: "monochrome", name: "Monochrome", mood: "Iconic · Direct", palette: ["#141414", "#777777", "#f5f3ed"], description: "High-contrast photography with one unforgettable idea." },
];
