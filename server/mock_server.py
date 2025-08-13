#!/usr/bin/env python3
"""
Mock server for testing AI Note Taker app without OpenAI API key.
Returns dummy responses for transcription, OCR, and summarization.
"""

import time
import random
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="QuickScribe Mock Server", version="0.1.0")

# CORS middleware for development
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

# Mock responses based on input type
MOCK_TRANSCRIPTS = [
    "Today I had a productive meeting about the quarterly project review. We discussed the new marketing strategy and identified three key areas for improvement.",
    "Remember to buy groceries: milk, eggs, bread, and apples. Also need to schedule a dentist appointment for next week.",
    "The conference presentation went well. Main feedback was to add more data visualization and reduce the text on slides.",
    "Weekly standup notes: completed user authentication, working on database optimization, blocked on API integration."
]

MOCK_OCR_TEXTS = [
    "Invoice #12345\nDate: August 13, 2025\nAmount: $149.99\nDue Date: September 15, 2025",
    "Meeting Notes\n- Project timeline discussion\n- Budget approval needed\n- Next meeting: Friday 2PM",
    "Recipe: Chocolate Chip Cookies\nIngredients:\n- 2 cups flour\n- 1 cup sugar\n- 1/2 cup butter",
    "Shopping List:\n✓ Milk\n✓ Eggs\n- Bread\n- Cheese\n- Tomatoes"
]

def generate_summary(text: str, level: str, want_actions: bool) -> str:
    """Generate mock summary based on input text and parameters."""
    
    # Simulate processing time
    time.sleep(random.uniform(1, 3))
    
    if level == "short":
        summaries = [
            "TL;DR: Productive meeting about quarterly review and marketing strategy improvements.",
            "TL;DR: Grocery shopping list and dentist appointment reminder.",
            "TL;DR: Conference presentation successful, needs more visuals and less text.",
            "TL;DR: Standup update on authentication, database work, and API blockers."
        ]
        base_summary = random.choice(summaries)
    elif level == "medium":
        summaries = [
            "• Quarterly project review meeting completed\n• Marketing strategy discussed with team\n• Three improvement areas identified\n• Next steps defined for implementation\n• Timeline established for deliverables",
            "• Grocery shopping needed: milk, eggs, bread, apples\n• Dentist appointment to be scheduled\n• Target: next week appointment\n• Personal task management update\n• Health maintenance priority",
            "• Conference presentation delivered successfully\n• Positive audience feedback received\n• More data visualization recommended\n• Text reduction on slides suggested\n• Future presentation improvements noted",
            "• User authentication module completed\n• Database optimization in progress\n• API integration currently blocked\n• Weekly team standup conducted\n• Project status updated"
        ]
        base_summary = random.choice(summaries)
    else:  # full
        summaries = [
            "## Meeting Summary\n\nToday's quarterly project review meeting was highly productive. The team gathered to discuss the current status of ongoing initiatives and evaluate our marketing strategy.\n\n## Key Discussion Points\n\nThe primary focus was on identifying areas for improvement in our current approach. Three critical areas were highlighted during the discussion.\n\n## Next Steps\n\nThe team will implement the discussed changes over the next quarter.",
            "## Personal Tasks\n\nThis note covers personal errands and appointments that need attention.\n\n## Shopping Requirements\n\nGrocery shopping is needed with specific items: milk, eggs, bread, and apples.\n\n## Healthcare\n\nA dentist appointment needs to be scheduled for next week to maintain oral health routine.",
            "## Presentation Review\n\nThe conference presentation was delivered and well-received by the audience.\n\n## Feedback Analysis\n\nMain constructive feedback focused on visual improvements and content optimization.\n\n## Recommendations\n\nFuture presentations should include more data visualization and reduce text density on slides.",
            "## Weekly Development Update\n\nThis standup covers current sprint progress and blockers.\n\n## Completed Work\n\nUser authentication module has been successfully implemented and tested.\n\n## Current Tasks\n\nDatabase optimization work is ongoing with performance improvements being implemented.\n\n## Blockers\n\nAPI integration is currently blocked and requires resolution."
        ]
        base_summary = random.choice(summaries)
    
    # Add action items if requested
    if want_actions:
        actions = [
            "\n\n## Action Items\n• Follow up with team by Friday\n• Schedule next review meeting\n• Prepare status report",
            "\n\n## Action Items\n• Complete grocery shopping this weekend\n• Call dentist office tomorrow\n• Set calendar reminder",
            "\n\n## Action Items\n• Update presentation template\n• Add more charts and graphs\n• Reduce text on each slide",
            "\n\n## Action Items\n• Resolve API integration blocker\n• Continue database optimization\n• Update project timeline"
        ]
        base_summary += random.choice(actions)
    
    return base_summary

@app.get("/")
async def root():
    return {"message": "QuickScribe Mock Server is running!", "status": "ready"}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """Mock transcription endpoint - returns sample transcript."""
    if not file.content_type or "audio" not in file.content_type:
        raise HTTPException(status_code=400, detail="Upload an audio file")
    
    # Simulate processing time
    time.sleep(random.uniform(2, 4))
    
    # Return random mock transcript
    mock_text = random.choice(MOCK_TRANSCRIPTS)
    return {"text": mock_text}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    """Mock OCR endpoint - returns sample text."""
    if not file.content_type or "image" not in file.content_type:
        raise HTTPException(status_code=400, detail="Upload an image file")
    
    # Simulate processing time
    time.sleep(random.uniform(1, 2))
    
    # Return random mock OCR text
    mock_text = random.choice(MOCK_OCR_TEXTS)
    return {"text": mock_text}

@app.post("/summarize")
async def summarize(body: SummarizeBody):
    """Mock summarization endpoint - returns sample summary."""
    
    # Generate mock summary based on parameters
    summary = generate_summary(body.text, body.level, body.want_actions)
    
    return {"summary": summary}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting QuickScribe Mock Server...")
    print("📝 This server provides dummy responses for testing without OpenAI API")
    print("🌐 Server will run on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
