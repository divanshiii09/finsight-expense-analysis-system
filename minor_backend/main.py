from modules.categorization import (
    categorize_transaction,
    classify_need_or_want
)

from modules.insights import compute_financial_metrics

from modules.visual_insights import (
    expense_by_category,
    need_vs_want,
    top_expenses,
    monthly_trends
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.upload import router as upload_router

app = FastAPI(title="Financial Statement Analyzer")

# ✅ Add this CORS block
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

@app.get("/")
def home():
    return {"message": "Backend running successfully"}