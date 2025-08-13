import os
from io import BytesIO
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image
import pytesseract
from openai import OpenAI

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY is not set")

client = OpenAI(api_key=api_key)
app = FastAPI(title="QuickScribe Proxy", version="0.1.0")

# adjust origins during local testing or add your Replit URL later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarizeBody(BaseModel):
    text: str = Field(min_length=1)
    level: str = Field(default="medium", pattern="^(short|medium|full)$")
    want_actions: bool = True

def system_prompt(level: str, want_actions: bool) -> str:
    levels = {
        "short": "Return a TL;DR of one or two tight sentences.",
        "medium": "Return five to eight crisp bullet points that cover the core ideas.",
        "full": "Return a structured brief with short headings and tight paragraphs."
    }
    action = "Also extract action items as bullets if tasks or follow ups exist." if want_actions else ""
    return f"Summarize for later reuse with clear, plain language. {levels[level]} {action}"

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    if not file.content_type or "audio" not in file.content_type:
        raise HTTPException(status_code=400, detail="Upload an audio file")
    data = await file.read()
    with BytesIO(data) as buf:
        buf.name = file.filename or "audio.m4a"
        buf.seek(0)
        result = client.audio.transcriptions.create(model="whisper-1", file=buf)
    return {"text": result.text}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    if not file.content_type or "image" not in file.content_type:
        raise HTTPException(status_code=400, detail="Upload an image file")
    data = await file.read()
    try:
        image = Image.open(BytesIO(data))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image")
    text = pytesseract.image_to_string(image)
    return {"text": text}

@app.post("/summarize")
async def summarize(body: SummarizeBody):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role":"system","content":system_prompt(body.level, body.want_actions)},
            {"role":"user","content":body.text}
        ],
        temperature=0.2,
    )
    return {"summary": completion.choices[0].message.content}
