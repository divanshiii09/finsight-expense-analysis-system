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
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
import routers.upload as upload
from routers.upload import router as upload_router
from modules.smart_insights import generate_smart_insights

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI(title="Financial Statement Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

class ChatRequest(BaseModel):
    user_query: str

@app.get("/")
def home():
    return {"message": "Backend running successfully"}

@app.post("/chat")
async def chat(request: ChatRequest):

    if not request.user_query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty"
        )

    # Check if financial data exists
    if not upload.latest_metrics:
        return {
            "ai_response": (
                "No financial data found. Please upload a statement "
                "and generate dashboard data first."
            )
        }

    query = request.user_query.lower()

    # Generate smart insights
    smart_insights = generate_smart_insights(
        upload.latest_metrics
    )

    # ==========================================
    # FAST RESPONSES (NO GEMINI NEEDED)
    # ==========================================

    if "spend the most" in query or "highest category" in query:
        return {
            "ai_response":
            f"You spent the most in "
            f"{upload.latest_metrics.get('top_category_name', 'Unknown')} "
            f"(₹{upload.latest_metrics.get('top_category_value', 0):,.2f})."
        }

    if "savings" in query:
        return {
            "ai_response":
            f"Your current savings are "
            f"₹{upload.latest_metrics.get('savings', 0):,.2f}."
        }

    # ==========================================
    # STRUCTURED FINANCIAL SUMMARY
    # ==========================================

    financial_summary = f"""
    Total Income: ₹{upload.latest_metrics.get('total_income', 0):,.2f}

    Total Expense: ₹{upload.latest_metrics.get('total_expense', 0):,.2f}

    Savings: ₹{upload.latest_metrics.get('savings', 0):,.2f}

    Daily Average Spend:
    ₹{upload.latest_metrics.get('daily_avg_spend', 0):,.2f}

    Top Spending Category:
    {upload.latest_metrics.get('top_category_name', 'N/A')}

    Top Category Amount:
    ₹{upload.latest_metrics.get('top_category_value', 0):,.2f}

    Category Breakdown:
    {upload.latest_metrics.get('category_breakdown', {})}
    """

    prompt = f"""
You are Finsight AI, an intelligent personal finance advisor for Indian users.

IMPORTANT RULES:
- All amounts are in Indian Rupees (₹).
- Never use dollars ($).
- Use only the provided financial data.
- Do not invent numbers.
- Give practical financial advice.
- Mention specific categories when relevant.
- Keep answers concise and useful.

Financial Summary:
{financial_summary}

Visual Insights:
{upload.latest_visuals}

Smart Insights:
{smart_insights}

User Question:
{request.user_query}
"""

    try:
        response = model.generate_content(prompt)

        return {
            "ai_response": response.text
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini Error: {str(e)}"
        )