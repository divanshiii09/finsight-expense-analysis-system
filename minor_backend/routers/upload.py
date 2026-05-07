from modules.visual_insights import (
    expense_by_category,
    need_vs_want,
    top_expenses,
    monthly_trends
)
from fastapi import APIRouter, UploadFile, File
from typing import List
from modules.parsers import parse_pdf
from modules.categorization import categorize_transaction 
from modules.categorization import classify_need_or_want 
from modules.insights import compute_financial_metrics

router = APIRouter()

@router.post("/upload-statement/")
async def upload_statement(
    file: UploadFile = File(..., description="Upload a PDF file")
):
    file_bytes = await file.read()

    df, detected_type, _ = parse_pdf(file_bytes)

    transactions = []
    metrics = {}
    visuals = {}

    if df is not None and not df.empty:
        df["category"] = df["description"].apply(categorize_transaction)
        df["classify"] = df["category"].apply(classify_need_or_want)

        transactions = df.to_dict(orient="records")

        # ✅ Metrics
        metrics = compute_financial_metrics(df)

        # ✅ Visual Data (NEW 🔥)
        visuals = {
            "expense_by_category": expense_by_category(df),
            "need_vs_want": need_vs_want(df),
            "top_expenses": top_expenses(df),
            "monthly_trends": monthly_trends(df)
        }

    return {
        "total_transactions": len(transactions),
        "metrics": metrics,
        "visuals": visuals,   # 🔥 NEW SECTION
        "transactions": transactions
    }