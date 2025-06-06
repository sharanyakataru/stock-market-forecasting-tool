from fastapi import FastAPI
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()  # FastAPI app initialized first
#CORS (for frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#routers
from src.routes.stock import router as stock_router
from src.routes.insights import router as insights_router  
from src.routes.portfolio import router as portfolio_router 



#API routers
app.include_router(stock_router)
app.include_router(insights_router)
app.include_router(portfolio_router)

#Server React frontend
frontend_path = os.path.join(os.getcwd(), "frontend", "dist")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    index_path = os.path.join(frontend_path, "index.html")
    return FileResponse(index_path)
