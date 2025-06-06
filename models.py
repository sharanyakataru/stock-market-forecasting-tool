from sqlalchemy import Column, String, Boolean
from database import Base

class Portfolio(Base):
    __tablename__ = "portfolio"

    user_id = Column(String, primary_key=True, index=True)
    symbol = Column(String, primary_key=True, index=True)
    is_simulated = Column(Boolean, default=False)