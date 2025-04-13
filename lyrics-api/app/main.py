from fastapi import FastAPI
from app.db.cache import LyricsCache
from app.api import routes

app = FastAPI(title="Lyrics Sync API")

app.include_router(routes.router)

@app.on_event("startup")
async def startup():

    await LyricsCache.init_db()