from pydantic import BaseModel
from datetime import date

class ManualTransaction(BaseModel):
    date: date
    amount: float
    category: str
    classify: str
    description: str
    source: str = "Manual Entry"
    transaction_type: str = "debit"