import pandas as pd

def compute_financial_metrics(df):

    if df.empty:
        return {
            "total_expense": 0,
            "spending_period_days": 0,
            "daily_avg_spend": 0,
            "total_transactions": 0,
            "top_category_name": None,
            "top_category_value": 0
        }

    total_transactions = len(df)

    # ✅ Fix date parsing
    df['date'] = pd.to_datetime(df['date'], errors='coerce')

    # ✅ FIX: Use type + amount instead of debit column
    expense_df = df[df['type'].str.lower() == 'debit'].dropna(subset=['date'])

    if expense_df.empty:
        return {
            "total_expense": 0,
            "spending_period_days": 0,
            "daily_avg_spend": 0,
            "total_transactions": total_transactions,
            "top_category_name": None,
            "top_category_value": 0
        }

    total_expense = expense_df['amount'].sum()

    start_date = expense_df['date'].min()
    end_date = expense_df['date'].max()

    num_days = (end_date - start_date).days + 1

    daily_avg_spend = total_expense / num_days

    # ✅ Top category
    top_cat_series = expense_df.groupby('category')['amount'].sum().nlargest(1)

    if not top_cat_series.empty:
        top_category_name = top_cat_series.index[0]
        top_category_value = float(top_cat_series.iloc[0])
    else:
        top_category_name = None
        top_category_value = 0

    return {
        "total_expense": float(total_expense),
        "spending_period_days": int(num_days),
        "daily_avg_spend": float(daily_avg_spend),
        "total_transactions": total_transactions,
        "top_category_name": top_category_name,
        "top_category_value": float(top_category_value)
    }