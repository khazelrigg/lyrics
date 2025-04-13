from fastapi import FastAPI
from app.db.cache import LyricsCache
from app.api import routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Lyrics Sync API")

# Allow frontend dev server on port 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)

@app.on_event("startup")
async def startup():

    await LyricsCache.init_db()