def generate_smart_insights(metrics):

    insights = []

    if metrics.get("savings", 0) < 0:
        insights.append(
            "Expenses are higher than income."
        )

    if metrics.get("top_category_name"):
        insights.append(
            f"Highest spending category: {metrics['top_category_name']}."
        )

    if metrics.get("daily_avg_spend", 0) > 1000:
        insights.append(
            "Daily average spending is relatively high."
        )

    return insights