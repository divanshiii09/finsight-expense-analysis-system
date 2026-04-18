import re

def categorize_transaction(Description: str) -> str:
    """
    Categorizes a transaction using a hierarchical, multi-layered logic to ensure accuracy.
    """
    desc_lower = str(Description or "").lower().strip()

    # Tier 1: High-Confidence Brands & Services (Unambiguous)
    HIGH_CONFIDENCE = {
        "Food & Dining": ["swiggy", "zomato", "dominos", "kfc", "mcdonald's", "pizzahut"],
        "Groceries": ["jiomart", "blinkit", "zepto", "bigbasket"],
        "Transport": ["uber", "ola", "rapido", "metro"],
        "Shopping": ["amazon", "flipkart", "myntra", "ajio", "meesho"],
        "Entertainment": ["netflix", "spotify", "hotstar", "prime video", "bookmyshow", "pvr", "inox"],
        "Investments": ["zerodha", "groww", "upstox", "wintwealth"],
        "Utilities": ["vodafone", "airtel", "jio", "recharge"]
    }

    # Tier 2: High-Confidence Business Types (Strong Indicators)
    BUSINESS_TYPES = {
        "Groceries": ["grocery", "karyana", "supermarket", "hypermarket", "alu shop"],
        "Health": ["pharmacy", "drug store", "medicose", "medical", "medicals", "hospital", "clinic", "chemist"],
        "Food & Dining": ["restaurant", "cafe", "sweets", "confectionery", "bakery", "eatery", "tiffin", "tiffin center", "stall", "hotel"],
        "Shopping": ["fashions", "handloom", "emporium", "gift", "variety store", "book store", "puja bhandar", "samagri"],
        "Transport": ["petrol", "fuel", "h p center", "filling station"],
        "Education": ["school", "college", "tuition", "udemy", "coursera"],
        "Utilities": ["electrical", "net for you", "communication"],
        "Rent": ["rent"]
    }

    # --- Categorization Logic ---

    # 1. Check High-Confidence Brands first for a quick and accurate match.
    for category, keywords in HIGH_CONFIDENCE.items():
        if any(keyword in desc_lower for keyword in keywords):
            return category

    # 2. Check for specific business types.
    for category, keywords in BUSINESS_TYPES.items():
        if any(keyword in desc_lower for keyword in keywords):
            return category
            
    # 3. Handle Generic Peer-to-Peer or Unclear Business Payments.
    generic_payment_pattern = r'^(gpay transaction:|paid to)'
    if re.search(generic_payment_pattern, desc_lower):
        all_keywords = [kw for sublist in list(HIGH_CONFIDENCE.values()) + list(BUSINESS_TYPES.values()) for kw in sublist]
        if not any(keyword in desc_lower for keyword in all_keywords):
            return "Bank & UPI Transfers"

    # 4. Fallback for generic bank terms if no other category fits.
    BANK_KEYWORDS = ["upi", "imps", "neft", "rtgs", "atm", "withdrawal", "deposit", "bank charge"]
    if any(word in desc_lower for word in BANK_KEYWORDS):
        return "Bank & UPI Transfers"

    # 5. If no rules match after all checks, label it for the AI.
    return "Other"


def classify_need_or_want(category: str) -> str:
    """Classifies a category as a 'Need', 'Want', or 'Other'."""
    needs = [
        "Food & Dining", "Groceries", "Transport", "Utilities", "Rent",
        "Medical", "Education", "Health", "Loans", "Bank Charges"
    ]
    wants = [
        "Shopping", "Entertainment", "Subscriptions"
    ]
    if category in needs:
        return "Need"
    if category in wants:
        return "Want"
    # Everything else (like Bank & UPI Transfers, Investments, Interest) is 'Other'.
    return "Other"