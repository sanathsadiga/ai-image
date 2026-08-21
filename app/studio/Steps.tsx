"use client";

import type { RefObject } from "react";
import { ArrowRight, Check, CheckCircle2, Download, FileImage, Grid2X2, LoaderCircle, LockKeyhole, ScanLine, Sparkles, Upload, WandSparkles, X } from "lucide-react";
import { DIRECTIONS, FORMATS } from "./data";
import type { Direction, Format } from "./types";

function FormatIcon({ shape }: { shape: string }) { return <div className={`format-icon ${shape}`}><i/><b/><em/></div>; }
function DirectionArt({ direction, selected }: { direction: Direction; selected: boolean }) { return <div className={`direction-art art-${direction.id} ${selected ? "selected" : ""}`}><span className="art-grain"/><span className="art-orb"/><span className="art-product"><i/></span><strong>{direction.id === "kinetic-type" ? "MAKE\nIT\nMOVE" : direction.id === "editorial-impact" ? "TRUST" : ""}</strong><span className="art-line"/></div>; }
function formatDimensions(id: string) {
  if (id === "french-window") return "658 × 525 mm spread";
  if (id === "skyline") return "329 × 110 mm ad";
  if (id === "half-page") return "329 × 250 mm ad";
  if (id === "island") return "180 × 220 mm ad";
  if (id === "bookmark") return "90 × 525 mm ad";
  if (id === "full-page") return "329 × 450 mm ad";
  if (id === "lband") return "80 mm side + 329 × 130 mm top/bottom";
  if (id === "edit-wrap") return "329 × 450 mm integrated body";
  return "329 × 525 mm page";
}

export function UploadStep({ file, inputRef, onFile, onRemove }: { file:File|null; inputRef:RefObject<HTMLInputElement|null>; onFile:(file:File|null)=>void; onRemove:()=>void }) {
  return <div className="panel narrow"><div className="eyebrow">STEP 01</div><h1>Bring in the brand.</h1><p className="lede">Upload the approved client artwork. We’ll identify the visual system and protected content.</p><div className={`dropzone ${file ? "has-file" : ""}`} onClick={() => inputRef.current?.click()}><input ref={inputRef} type="file" accept="image/*,.pdf" hidden onChange={e => onFile(e.target.files?.[0] || null)}/>{file ? <><FileImage size={34}/><b>{file.name}</b><span>{(file.size/1024/1024).toFixed(1)} MB · Ready to analyse</span><button onClick={e => { e.stopPropagation(); onRemove(); }}><X size={14}/> Remove</button></> : <><span className="upload-icon"><Upload size={24}/></span><b>Drop client artwork here</b><span>PDF, PNG or JPG up to 25 MB</span><button>Choose file</button></>}</div><div className="asset-grid"><div><ScanLine/><b>Brand system</b><span>Palette, typography and tone</span></div><div><LockKeyhole/><b>Protected assets</b><span>Logo, products, QR and copy</span></div><div><WandSparkles/><b>Creative cues</b><span>Composition and visual motifs</span></div></div></div>;
}

export function FormatStep({ selected, active, lbandSide, lbandVertical, pagePlacement, onSelect, onLbandSide, onLbandVertical, onPagePlacement }: { selected:string; active:Format; lbandSide:"right"|"left"; lbandVertical:"bottom"|"top"; pagePlacement:"front"|"inside"; onSelect:(id:string)=>void; onLbandSide:(side:"right"|"left")=>void; onLbandVertical:(position:"bottom"|"top")=>void; onPagePlacement:(placement:"front"|"inside")=>void }) {
  const pageSize = active.id === "french-window" ? "658 × 525 mm spread" : "329 × 525 mm page";
  const lbandLabel = lbandSide === "right" ? "Right ⅃ · editorial on left" : "Left L · editorial on right";
  const headerLabel = pagePlacement === "front" ? "75 mm front-page masthead" : "23 mm inside-page header";
  const specification = `${pageSize} · ${headerLabel} · ${active.id === "lband" ? `${lbandLabel} · horizontal leg on ${lbandVertical}` : formatDimensions(active.id)} · 8 mm safe area`;
  return <div className="panel">
    <div className="eyebrow">STEP 02</div><h1>Choose a Inovations.</h1><p className="lede">Select an exact newspaper format. Every option is built to VK production specifications.</p>
    <div className="page-placement" aria-label="Page placement"><b>Choose page placement</b><div>
      <button className={pagePlacement === "front" ? "selected" : ""} onClick={() => onPagePlacement("front")}><strong>Front page</strong><small>Full masthead · 45 cm body</small></button>
      <button className={pagePlacement === "inside" ? "selected" : ""} onClick={() => onPagePlacement("inside")}><strong>Inside page</strong><small>Slim section header · ≈50.2 cm body</small></button>
    </div></div>
    <div className="format-grid">{FORMATS.map(f => <button key={f.id} onClick={() => onSelect(f.id)} className={`format-card ${selected === f.id ? "selected" : ""}`}>{f.badge && <span className="badge">{f.badge}</span>}<span className="check"><Check size={13}/></span><FormatIcon shape={f.shape}/><b>{f.name}</b><small>{f.subtitle}</small><span className="dimensions">{formatDimensions(f.id)}</span></button>)}</div>
    {selected === "lband" && <div className="lband-options" aria-label="L-band orientation">
      <b>Choose L-band side</b><div className="lband-choice-grid">
        <button className={lbandSide === "right" && lbandVertical === "bottom" ? "selected" : ""} onClick={() => { onLbandSide("right"); onLbandVertical("bottom"); }}><span className="lband-symbol">⅃</span><span><strong>Right ⅃</strong><small>Ad right · leg bottom</small></span></button>
        <button className={lbandSide === "left" && lbandVertical === "bottom" ? "selected" : ""} onClick={() => { onLbandSide("left"); onLbandVertical("bottom"); }}><span className="lband-symbol">L</span><span><strong>Left L</strong><small>Ad left · leg bottom</small></span></button>
        <button className={lbandSide === "left" && lbandVertical === "top" ? "selected" : ""} onClick={() => { onLbandSide("left"); onLbandVertical("top"); }}><span className="lband-symbol lband-symbol-flipped">L</span><span><strong>Vertical flip</strong><small>Ad left · leg top</small></span></button>
        <button className={lbandSide === "right" && lbandVertical === "top" ? "selected" : ""} onClick={() => { onLbandSide("right"); onLbandVertical("top"); }}><span className="lband-symbol lband-symbol-flipped">⅃</span><span><strong>Horizontal flip</strong><small>Ad right · leg top</small></span></button>
      </div>
    </div>}
    <div className="spec-strip"><div><Grid2X2 size={17}/><span><b>{active.name} specification</b><small>{specification}</small></span></div><button>View technical sheet <ArrowRight size={14}/></button></div>
  </div>;
}

export function DirectionStep({ selected, onSelect }: { selected:string; onSelect:(id:string)=>void }) {
  return <div className="panel"><div className="eyebrow">STEP 03</div><h1>Pick a creative direction.</h1><p className="lede">Six distinct visual territories, grounded in the uploaded brand. AI creates only the background concept.</p><div className="direction-grid">{DIRECTIONS.map(d => <button key={d.id} onClick={() => onSelect(d.id)} className={`direction-card ${selected === d.id ? "selected" : ""}`}><DirectionArt direction={d} selected={selected === d.id}/><div className="direction-copy"><span className="radio"><i/></span><b>{d.name}</b><small>{d.mood}</small><p>{d.description}</p><div className="swatches">{d.palette.map(c => <i key={c} style={{background:c}}/>)}</div></div></button>)}</div></div>;
}

export function ComposeStep({ format, svg, brand, headline, busy, onBrand, onHeadline, onGenerate }: { format:Format; svg:string; brand:string; headline:string; busy:boolean; onBrand:(value:string)=>void; onHeadline:(value:string)=>void; onGenerate:()=>void }) {
  return <div className="compose-layout"><div className="canvas-area"><div className="canvas-toolbar"><span><b>Front cover</b> · {format.name}</span><span>42% <button>−</button><button>+</button></span></div><div className="newspaper"><div className="paper-shadow"/><div dangerouslySetInnerHTML={{__html:svg}}/></div></div><aside className="properties"><div className="prop-head"><div className="eyebrow">COMPOSE</div><h2>Final artwork</h2><p>Protected elements are rendered separately from the AI concept.</p></div><label>BRAND NAME<input value={brand} onChange={e => onBrand(e.target.value.toUpperCase())}/></label><label>APPROVED HEADLINE<textarea value={headline} onChange={e => onHeadline(e.target.value)} rows={2}/><span className="locked"><LockKeyhole size={11}/> Exact text layer</span></label><div className="layer-list"><b>LOCKED ASSETS</b>{[["Official masthead","SVG"],["Product artwork","PNG"],["Brand logo","SVG"],["QR code","PNG"]].map(([a,b]) => <div key={a}><span><LockKeyhole size={13}/>{a}</span><small>{b}</small></div>)}</div><button className="regenerate" onClick={onGenerate} disabled={busy}>{busy ? <LoaderCircle className="spin" size={15}/> : <Sparkles size={15}/>} {busy ? "Generating…" : "Regenerate creative"}</button></aside></div>;
}

export function ExportStep({ svg, onDownload }: { svg:string; onDownload:()=>void }) {
  const checks = ["Exact format geometry","Bleed & safe zones","Official masthead","Logo asset integrity","Approved copy match","QR code readability"];
  return <div className="panel export-panel"><div className="eyebrow">STEP 05</div><h1>Ready for press.</h1><p className="lede">All production checks passed. Export the artwork or share the catalogue preview.</p><div className="export-layout"><div className="export-preview"><div dangerouslySetInnerHTML={{__html:svg}}/></div><div className="validation-card"><div className="validation-head"><span><CheckCircle2 size={25}/></span><div><b>12 of 12 checks passed</b><small>Validated just now</small></div></div>{checks.map(x => <div className="check-row" key={x}><Check size={14}/><span>{x}</span><small>Passed</small></div>)}<div className="download-actions"><button onClick={onDownload}><Download size={16}/> Production JPG</button><button className="secondary"><Download size={16}/> Catalogue PDF</button></div></div></div></div>;
}
