# Project Title

This repository contains a Python-based Jupyter Notebook project.

## Overview
This notebook performs data analysis and NLP/deep learning tasks using libraries such as NLTK, Transformers, and PyTorch.

## Getting Started

### 1) Install dependencies
```bash
pip install -r requirements.txt
```

### 2) Run the web app (FastAPI)
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open `http://localhost:8000` in your browser.

Endpoints:
- `GET /` — serves the animated frontend
- `POST /api/predict` — request body: `{ "text": "your statement" }`
  - returns: `{ label: "Fake" | "Not Fake", confidence: number, all: Array<{label, score}> }`

Notes:
- First request will download the `facebook/bart-large-mnli` model; this may take a minute.
- GPU will be used automatically if available.

## Files
- Project.ipynb — main notebook
- requirements.txt — dependencies
- .gitignore — ignore rules

## Author
Dinesh Chapala
