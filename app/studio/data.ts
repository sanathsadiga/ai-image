import type { Direction, Format } from "./types";

export const FORMATS: Format[] = [
  { id: "full-page", name: "Main / Jacket", subtitle: "Header + 329 × 450 mm ad", ratio: 329 / 525, badge: "ENABLED", shape: "wrap" },
  { id: "lband", name: "L-Band", subtitle: "80 mm side + 130 mm horizontal leg", ratio: 329 / 525, shape: "l" },
  { id: "french-window", name: "French Window", subtitle: "658 × 525 mm double-page spread", ratio: 658 / 525, badge: "PREMIUM", shape: "window" },
  { id: "edit-wrap", name: "Edit Wrap", subtitle: "Integrated hero + editorial surround", ratio: 329 / 525, shape: "frame" },
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
  { id: "editorial-impact", name: "Editorial Impact", mood: "Authoritative · Clear", palette: ["#17263b", "#b8903c", "#f5f1e8"], description: "Strong hierarchy and newsroom clarity built for trusted print environments." },
  { id: "local-resonance", name: "Local Resonance", mood: "Warm · Relevant", palette: ["#8f2525", "#e3a52e", "#f7eedc"], description: "Human storytelling and culturally familiar colour with broad Karnataka appeal." },
];
