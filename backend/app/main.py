from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env.local")

from .ai import analyze_artwork, generate_background, generate_directions
from .database import init_db, list_projects, save_project
from .models import BrandAnalysis, RenderRequest, RenderResponse
from .renderer import FORMATS, render_svg


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="PressForm Studio API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        "http://10.175.8.125:3000",
        "https://athletes-unknown-crew-demonstration.trycloudflare.com",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|0\.0\.0\.0|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health(): return {"status":"ok", "renderer":"deterministic", "formats":len(FORMATS)}


@app.get("/api/formats")
def formats(): return [{"id":k,"width_mm":v[0],"height_mm":v[1]} for k,v in FORMATS.items()]


@app.post("/api/analyze", response_model=BrandAnalysis)
async def analyze(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > 25 * 1024 * 1024: raise HTTPException(413, "File exceeds 25 MB")
    try: return analyze_artwork(data, file.content_type or "image/png")
    except Exception as exc: raise HTTPException(502, f"AI analysis failed: {exc}") from exc


@app.post("/api/directions")
def directions(analysis: BrandAnalysis): return generate_directions(analysis)


@app.post("/api/background")
async def background(prompt: str = Form(...), format_id: str = Form(""), direction_id: str = Form(""), lband_side: str = Form("right"), lband_vertical: str = Form("bottom"), page_placement: str = Form("front"), file: Optional[UploadFile] = File(None)):
    if file and not (file.content_type or "").startswith("image/"):
        raise HTTPException(415, "The generation reference must be a PNG, JPG, or WebP image")
    reference_data = await file.read() if file else None
    if lband_side not in {"right", "left"}:
        raise HTTPException(422, "L-band side must be right or left")
    if lband_vertical not in {"bottom", "top"}:
        raise HTTPException(422, "L-band vertical position must be bottom or top")
    if page_placement not in {"front", "inside"}:
        raise HTTPException(422, "Page placement must be front or inside")
    try: return {"data_url":generate_background(prompt, reference_data, file.filename if file else "reference.png", format_id, direction_id, lband_side, lband_vertical, page_placement), "mode":"live" if __import__('os').getenv('OPENAI_API_KEY') else "demo"}
    except Exception as exc: raise HTTPException(502, f"Image generation failed: {exc}") from exc


@app.post("/api/render", response_model=RenderResponse)
def render(req: RenderRequest):
    try: return render_svg(req)
    except ValueError as exc: raise HTTPException(400, str(exc)) from exc


@app.get("/api/projects")
def projects(): return list_projects()


@app.put("/api/projects/{project_id}")
def upsert(project_id: str, payload: dict):
    save_project(project_id, payload.get("name", "Untitled campaign"), payload)
    return {"saved":True, "id":project_id}
