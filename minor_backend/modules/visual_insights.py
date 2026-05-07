import pandas as pd

# 1. Expense by Category
def expense_by_category(df):
    df = df.copy()

    expense_df = df[df['type'].str.lower() == 'debit']

    if expense_df.empty:
        return []

    result = (
        expense_df.groupby('category')['amount']
        .sum()
        .sort_values(ascending=False)
        .reset_index()
    )

    return result.to_dict(orient="records")


# 2. Need vs Want
def need_vs_want(df):
    if 'classify' not in df.columns:
        return []

    expense_df = df[df['type'].str.lower() == 'debit']

    result = (
        expense_df.groupby('classify')['amount']
        .sum()
        .reset_index()
    )

    return result.to_dict(orient="records")


# 3. Top Expenses
def top_expenses(df, top_n=10):
    expense_df = df[df['type'].str.lower() == 'debit']

    if expense_df.empty:
        return []

    top_df = expense_df.nlargest(top_n, 'amount')

    return top_df[['description', 'amount', 'date']].to_dict(orient="records")


# 4. Monthly Trends
def monthly_trends(df):
    df = df.copy()

    df['date'] = pd.to_datetime(df['date'], format='%d%b,%Y', errors='coerce')
    df.dropna(subset=['date'], inplace=True)

    df['month'] = df['date'].dt.to_period('M').astype(str)

    income = df[df['type'] == 'credit'].groupby('month')['amount'].sum()
    expense = df[df['type'] == 'debit'].groupby('month')['amount'].sum()

    result = pd.DataFrame({
        'income': income,
        'expense': expense
    }).fillna(0).reset_index()

    return result.to_dict(orient="records")