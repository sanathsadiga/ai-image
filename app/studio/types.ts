export type Format = { id: string; name: string; subtitle: string; ratio: number; badge?: string; shape: string };
export type Direction = { id: string; name: string; mood: string; palette: string[]; description: string };
export type ApiDirection = { id: string; name: string; mood: string; palette: string[]; concept: string; image_prompt: string };
export type BrandAnalysis = { brand_name: string; palette: string[]; tone: string[]; visual_motifs: string[]; protected_copy: string[]; has_logo: boolean; has_qr: boolean; confidence: number };

