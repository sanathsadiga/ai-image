"use client";

import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { apiRequest, getApiUrl } from "./studio/api";
import { createFallbackSvg, downloadArtworkJpeg } from "./studio/artwork";
import { DIRECTIONS, FORMATS } from "./studio/data";
import { Footer, Header, Sidebar } from "./studio/StudioChrome";
import { ComposeStep, DirectionStep, ExportStep, FormatStep, UploadStep } from "./studio/Steps";
import type { ApiDirection, BrandAnalysis } from "./studio/types";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(2);
  const [format, setFormat] = useState("full-page");
  const [direction, setDirection] = useState("quiet-luxury");
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null);
  const [apiDirections, setApiDirections] = useState<ApiDirection[]>([]);
  const [background, setBackground] = useState<string | null>(null);
  const [renderedSvg, setRenderedSvg] = useState<string | null>(null);
  const [headline, setHeadline] = useState("Made for the moment.");
  const [brand, setBrand] = useState("NORTH & CO.");
  const activeFormat = FORMATS.find(item => item.id === format)!;
  const activeDirection = DIRECTIONS.find(item => item.id === direction)!;
  const fallbackSvg = useMemo(() => createFallbackSvg(activeDirection, brand, headline), [activeDirection, brand, headline]);
  const artworkSvg = renderedSvg || fallbackSvg;

  const resetGeneratedArtwork = (nextFile: File | null) => {
    setFile(nextFile); setAnalysis(null); setApiDirections([]); setBackground(null);
    setRenderedSvg(null); setGenerated(false); setError("");
  };

  const analyzeUpload = async () => {
    if (!file) return;
    setAnalyzing(true); setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const result = await apiRequest<BrandAnalysis>("/api/analyze", { method: "POST", body: form });
      const directions = await apiRequest<ApiDirection[]>("/api/directions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(result) });
      setAnalysis(result); setApiDirections(directions);
      if (result.brand_name) setBrand(result.brand_name.toUpperCase());
      if (result.protected_copy[0]) setHeadline(result.protected_copy[0]);
      setStep(2);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Artwork analysis failed"); }
    finally { setAnalyzing(false); }
  };

  const renderArtwork = async (backgroundDataUrl: string | null = background, preserveSource = false) => {
    const result = await apiRequest<{svg:string}>("/api/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project_id:"demo", format_id:format, direction_id:direction, brand_name:brand, headline, background_data_url:backgroundDataUrl, preserve_source:preserveSource }) });
    setRenderedSvg(result.svg);
  };

  const generateConcept = async () => {
    setBusy(true); setGenerated(false); setError("");
    try {
      const selected = apiDirections.find(item => item.id === direction);
      const prompt = selected?.image_prompt || `Create a polished new editorial advertising treatment based on the supplied artwork. Mood: ${activeDirection.mood}. Keep the exact blue Maruti Suzuki e VITARA as the hero vehicle with the same design, color, proportions, camera angle, badges, wheels, and identifying details. Preserve the Maruti Suzuki and NEXA branding and all supplied campaign meaning. Improve the environment, lighting, hierarchy, and composition without introducing unrelated products or objects.`;
      const form = new FormData(); form.append("prompt", prompt); form.append("format_id", format); form.append("direction_id", direction); if (file) form.append("file", file);
      const result = await apiRequest<{data_url:string|null; mode:string}>("/api/background", { method:"POST", body:form });
      setBackground(result.data_url); await renderArtwork(result.data_url, true); setGenerated(true); setStep(4);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Concept generation failed"); }
    finally { setBusy(false); }
  };

  const next = async () => {
    if (step === 1) return analyzeUpload();
    if (step === 3) return generateConcept();
    if (step === 4) {
      setBusy(true); setError("");
      try { await renderArtwork(background, true); setStep(5); }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Validation failed"); }
      finally { setBusy(false); }
      return;
    }
    setStep(value => Math.min(5, value + 1));
  };

  return <main>
    <Header/>
    <div className="shell">
      <Sidebar step={step} onStep={setStep}/>
      <section className="workspace">
        {error && <div className="error-banner"><b>Couldn’t complete that action.</b><span>{error}. Check that the backend is running at {getApiUrl()}.</span><button onClick={() => setError("")}><X size={14}/></button></div>}
        {step === 1 && <UploadStep file={file} inputRef={inputRef} onFile={resetGeneratedArtwork} onRemove={() => resetGeneratedArtwork(null)}/>} 
        {step === 2 && <FormatStep selected={format} active={activeFormat} onSelect={setFormat}/>} 
        {step === 3 && <DirectionStep selected={direction} onSelect={setDirection}/>} 
        {step === 4 && <ComposeStep format={activeFormat} svg={artworkSvg} brand={brand} headline={headline} busy={busy} onBrand={setBrand} onHeadline={setHeadline} onGenerate={generateConcept}/>} 
        {step === 5 && <ExportStep svg={artworkSvg} onDownload={() => downloadArtworkJpeg(artworkSvg, setError)}/>} 
      </section>
    </div>
    <Footer step={step} busy={busy} analyzing={analyzing} file={file} analysis={analysis} format={activeFormat} direction={activeDirection} generated={generated} onBack={() => setStep(value => Math.max(1, value - 1))} onNext={next}/>
  </main>;
}
