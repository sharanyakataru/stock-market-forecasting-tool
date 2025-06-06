# stock-market-forecasting-tool

A full-stack web application that displays real-time stock data, market indexes, and lets users track their personal portfolio. Built using **FastAPI** for the backend and **React** for the frontend.

---

##Features

- View real-time prices for popular stocks
- Market overview for major indexes (S&P 500, NASDAQ, etc.)
- Save and remove stocks from your personal portfolio
- Backend caching for better performance
- Responsive and user-friendly UI

---

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** FastAPI, Uvicorn
- **APIs:** Twelve Data (for stock data)
- **Other:** Git, Python, Node.js

---

## Installation

### Clone the repository:

```bash
git clone https://github.com/sharanyakataru/stock-market-forecasting-tool.git
cd stock-market-forecasting-tool

```
---

## Backend
- python3 -m venv .venv
- source .venv/bin/activate
- pip install -r requirements.txt
- uvicorn src.main:app --reload

---
## Frontend
- cd frontend
- npm install
- npm run dev

---
## Endpoints
- /api/stockprice/{ticker} – Get real-time stock price
- /api/market-overview – Get latest data for major market indexes
- /api/portfolio/{user_id} – Get saved stocks for a user
- /api/portfolio/remove – Remove a stock from portfolio

