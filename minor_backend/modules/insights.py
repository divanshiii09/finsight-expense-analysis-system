import pandas as pd

def compute_financial_metrics(df):

    if df.empty:
        return {}

    df['date'] = pd.to_datetime(df['date'], errors='coerce')

    total_transactions = len(df)

    # Income and Expense DataFrames
    expense_df = df[df['type'].str.lower() == 'debit'].copy()
    income_df = df[df['type'].str.lower() == 'credit'].copy()

    # Total Income and Expense
    total_income = income_df['amount'].sum()
    total_expense = expense_df['amount'].sum()

    # Savings
    savings = total_income - total_expense

    # Spending Period
    expense_dates = expense_df.dropna(subset=['date'])

    if not expense_dates.empty:
        start_date = expense_dates['date'].min()
        end_date = expense_dates['date'].max()

        spending_period_days = (end_date - start_date).days + 1
        daily_avg_spend = total_expense / spending_period_days
    else:
        spending_period_days = 0
        daily_avg_spend = 0

    # Category Breakdown
    category_breakdown = (
        expense_df.groupby('category')['amount']
        .sum()
        .to_dict()
    )

    # Top Category
    if category_breakdown:
        top_category_name = max(
            category_breakdown,
            key=category_breakdown.get
        )
        top_category_value = category_breakdown[top_category_name]
    else:
        top_category_name = None
        top_category_value = 0

    # Need vs Want (if column exists)
    need_spending = 0
    want_spending = 0

    if 'need_want' in df.columns:
        need_spending = expense_df[
            expense_df['need_want'].str.lower() == 'need'
        ]['amount'].sum()

        want_spending = expense_df[
            expense_df['need_want'].str.lower() == 'want'
        ]['amount'].sum()

    return {
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "savings": float(savings),

        "spending_period_days": int(spending_period_days),
        "daily_avg_spend": float(daily_avg_spend),

        "total_transactions": int(total_transactions),

        "category_breakdown": category_breakdown,

        "top_category_name": top_category_name,
        "top_category_value": float(top_category_value),

        "need_spending": float(need_spending),
        "want_spending": float(want_spending)
    }