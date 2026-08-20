# PressForm Studio

An internal newspaper advertising studio that separates AI-generated creative material from deterministic, production-safe composition.

## Stack

- Next.js 15 + TypeScript frontend
- FastAPI + SQLite backend
- Deterministic SVG renderer with eight predefined newspaper formats
- Optional OpenAI vision analysis and GPT Image concept generation
- Demo fallbacks so the complete workflow runs without an API key

## Run locally

```bash
# Terminal 1
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2
npm install
npm run dev
```

Open `http://localhost:3000` on this machine or `http://<system-ip>:3000` from another device on the same network. The frontend automatically calls the backend at the same hostname on port 8000. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` in the backend environment to enable live AI generation.

## Architecture

The AI layer only returns analysis and background concepts. `backend/app/renderer.py` owns final dimensions, masthead, exact copy, logos, product art, QR placement, and SVG output. All rendered designs pass geometry and content validation before export.
