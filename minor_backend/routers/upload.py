from fastapi import APIRouter, UploadFile, File
import pandas as pd

from modules.parsers import parse_pdf
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
from modules.models import ManualTransaction

router = APIRouter()

# =====================================================
# MASTER TRANSACTION STORE
# Stores:
# - Uploaded PDF transactions
# - Manual transactions
# =====================================================
transactions_store = []


# =====================================================
# UPLOAD PDF STATEMENT
# =====================================================
@router.post("/upload-statement/")
async def upload_statement(
    file: UploadFile = File(..., description="Upload a PDF file")
):

    file_bytes = await file.read()

    df, detected_type, _ = parse_pdf(file_bytes)

    uploaded_transactions = []

    if df is not None and not df.empty:

        # Normalize columns
        df.columns = df.columns.str.lower()

        # Fill missing descriptions
        df["description"] = df["description"].fillna("Unknown")

        # Auto category prediction
        df["category"] = df["description"].apply(categorize_transaction)

        # Auto need/want classification
        df["classify"] = df["category"].apply(classify_need_or_want)

        # Convert dataframe to list
        uploaded_transactions = df.to_dict(orient="records")

        # Add uploaded transactions to master store
        transactions_store.extend(uploaded_transactions)

    return {
        "message": "Statement uploaded successfully",
        "detected_type": detected_type,
        "uploaded_transactions": len(uploaded_transactions),
        "total_transactions": len(transactions_store)
    }


# =====================================================
# ADD MANUAL TRANSACTION
# =====================================================
@router.post("/add-manual-transaction/")
async def add_manual_transaction(txn: ManualTransaction):

    # Auto category prediction
    category = categorize_transaction(txn.description)

    # Auto need/want classification
    classify = classify_need_or_want(category)

    # Create transaction object
    new_transaction = {
        "date": str(txn.date),
        "type": txn.transaction_type.lower(),
        "description": txn.description,
        "amount": txn.amount,
        "source": txn.source,
        "category": category,
        "classify": classify
    }

    # Add to master transaction store
    transactions_store.append(new_transaction)

    return {
        "message": "Manual transaction added successfully",
        "transaction": new_transaction,
        "total_transactions": len(transactions_store)
    }


# =====================================================
# DASHBOARD DATA API
# =====================================================
@router.get("/dashboard-data/")
async def get_dashboard_data():

    if not transactions_store:
        return {
            "total_transactions": 0,
            "metrics": {},
            "visuals": {},
            "transactions": []
        }

    # Convert all transactions to DataFrame
    df = pd.DataFrame(transactions_store)

    # Generate metrics
    metrics = compute_financial_metrics(df)

    # Generate visual insights
    visuals = {
        "expense_by_category": expense_by_category(df),
        "need_vs_want": need_vs_want(df),
        "top_expenses": top_expenses(df),
        "monthly_trends": monthly_trends(df)
    }

    return {
        "total_transactions": len(transactions_store),
        "metrics": metrics,
        "visuals": visuals,
        "transactions": transactions_store
    }