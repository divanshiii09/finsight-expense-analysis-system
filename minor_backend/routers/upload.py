from fastapi import APIRouter, UploadFile, File
from typing import List
from modules.parsers import parse_pdf
from modules.categorization import categorize_transaction 
from modules.categorization import classify_need_or_want 

router = APIRouter()

@router.post("/upload-statement/")
async def upload_statement(
    file: UploadFile = File(..., description="Upload a PDF file")
):
    file_bytes = await file.read()

    df, detected_type, _ = parse_pdf(file_bytes)

    transactions = []

    if df is not None and not df.empty:
        df["category"] = df["description"].apply(categorize_transaction)
        df["classify"] = df["category"].apply(classify_need_or_want)
        transactions = df.to_dict(orient="records")

    return {
        "total_transactions": len(transactions),
        "transactions": transactions
    }