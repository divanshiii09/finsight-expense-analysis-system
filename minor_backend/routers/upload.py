from fastapi import APIRouter, UploadFile, File
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

# Temporary in-memory storage
manual_transactions = []


# ==============================
# Upload PDF Statement Endpoint
# ==============================
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

        # Normalize column names
        df.columns = df.columns.str.lower()

        # Clean missing descriptions
        df["description"] = df["description"].fillna("Unknown")

        # Auto categorization
        df["category"] = df["description"].apply(categorize_transaction)

        # Need / Want classification
        df["classify"] = df["category"].apply(classify_need_or_want)

        # Convert dataframe to JSON response
        transactions = df.to_dict(orient="records")

        # Financial Metrics
        metrics = compute_financial_metrics(df)

        # Visual Insights Data
        visuals = {
            "expense_by_category": expense_by_category(df),
            "need_vs_want": need_vs_want(df),
            "top_expenses": top_expenses(df),
            "monthly_trends": monthly_trends(df)
        }

    return {
        "detected_type": detected_type,
        "total_transactions": len(transactions),
        "metrics": metrics,
        "visuals": visuals,
        "transactions": transactions
    }


# ====================================
# Add Manual Transaction Endpoint
# ====================================
@router.post("/add-manual-transaction/")
async def add_manual_transaction(txn: ManualTransaction):

    # Auto category prediction
    category = categorize_transaction(txn.description)

    # Auto need/want prediction
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

    # Store transaction temporarily
    manual_transactions.append(new_transaction)

    return {
        "message": "Manual transaction added successfully",
        "transaction": new_transaction,
        "total_manual_transactions": len(manual_transactions)
    }


# ====================================
# Get All Manual Transactions
# ====================================
@router.get("/manual-transactions/")
async def get_manual_transactions():

    return {
        "total_manual_transactions": len(manual_transactions),
        "transactions": manual_transactions
    }