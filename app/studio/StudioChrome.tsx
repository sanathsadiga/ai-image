"use client";

import { ArrowLeft, ArrowRight, Check, ChevronDown, Layers3, LoaderCircle, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import type { BrandAnalysis, Direction, Format } from "./types";

export function Header() {
  return <header className="topbar"><div className="logo"><span><Layers3 size={18}/></span> PRESSFORM <small>STUDIO</small></div><div className="project-name"><i/> Summer Brand Campaign <ChevronDown size={14}/></div><div className="top-actions"><span>Saved just now</span><button className="icon-btn"><RotateCcw size={16}/></button><div className="avatar">SK</div></div></header>;
}

export function Sidebar({ step, onStep }: { step: number; onStep: (step: number) => void }) {
  const steps: [number, string, string][] = [[1,"Brand assets","Upload & analyse"],[2,"Select format","Choose placement"],[3,"Creative direction","Set the visual idea"],[4,"Compose","Fine-tune artwork"],[5,"Validate & export","Production checks"]];
  return <aside className="sidebar"><div className="steps-label">CREATE CAMPAIGN</div>{steps.map(([n,title,sub]) => <button key={n} onClick={() => onStep(n)} className={`step ${step === n ? "active" : ""} ${step > n ? "done" : ""}`}><span className="step-num">{step > n ? <Check size={13}/> : n}</span><span><b>{title}</b><small>{sub}</small></span></button>)}<div className="side-note"><LockKeyhole size={16}/><div><b>Production-safe</b><span>Logos, copy and QR codes remain untouched by AI.</span></div></div></aside>;
}

export function Footer({ step, busy, analyzing, file, analysis, format, direction, generated, onBack, onNext }: { step:number; busy:boolean; analyzing:boolean; file:File|null; analysis:BrandAnalysis|null; format:Format; direction:Direction; generated:boolean; onBack:()=>void; onNext:()=>void }) {
  const status = analysis && step === 2 ? `${analysis.brand_name} analysed · ${Math.round(analysis.confidence * 100)}% confidence` : step === 2 ? `${format.name} selected` : step === 3 ? direction.name : step === 4 ? generated ? "Full-page concept generated" : "Ready" : "";
  const label = analyzing ? "Analysing…" : busy && step === 3 ? "Generating full page…" : busy ? "Working…" : step === 3 ? "Generate full-page concept" : step === 4 ? "Validate artwork" : "Continue";
  return <footer className="bottom-bar"><button className="back" onClick={onBack} disabled={step === 1 || busy || analyzing}><ArrowLeft size={16}/> Back</button><span>{status}</span>{step < 5 && <button className="continue" onClick={onNext} disabled={(step === 1 && !file) || busy || analyzing}>{(analyzing || busy) ? <LoaderCircle className="spin" size={16}/> : step === 3 ? <Sparkles size={16}/> : null}{label}<ArrowRight size={16}/></button>}</footer>;
}
