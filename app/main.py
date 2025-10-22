from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import torch
from transformers import pipeline
import os

app = FastAPI(title="Fake News Detector")

# Mount static directory for the frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

class PredictRequest(BaseModel):
    text: str

# Lazy-load the zero-shot classifier
_zero_shot = None


def get_classifier():
    global _zero_shot
    if _zero_shot is None:
        device = 0 if torch.cuda.is_available() else -1
        # Use a lightweight NLI model suitable for zero-shot classification
        _zero_shot = pipeline(
            "zero-shot-classification",
            model="typeform/distilbert-base-uncased-mnli",
            device=device,
        )
    return _zero_shot


@app.get("/", response_class=HTMLResponse)
async def index():
    # Serve the main HTML page
    with open(os.path.join("static", "index.html"), "r", encoding="utf-8") as f:
        return f.read()


@app.post("/api/predict")
async def predict(req: PredictRequest):
    text = (req.text or "").strip()
    if not text:
        return JSONResponse({"error": "Text is required."}, status_code=400)

    classifier = get_classifier()

    labels = ["Fake", "Not Fake"]
    hypothesis_template = "This statement is {}."

    result = classifier(text, labels, hypothesis_template=hypothesis_template, multi_label=False)

    # Map to label/confidence
    top_label = result["labels"][0]
    score = float(result["scores"][0])

    return {
        "label": top_label,
        "confidence": score,
        "all": [{"label": l, "score": float(s)} for l, s in zip(result["labels"], result["scores"])],
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
