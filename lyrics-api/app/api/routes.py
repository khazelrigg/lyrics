from fastapi import APIRouter, Query, HTTPException
from app.models.lyrics import LyricsData
from app.core.lyrics_manager import LyricsManager
from app.db.cache import LyricsCache

router = APIRouter()
manager = LyricsManager()

@router.get("/lyrics", response_model=LyricsData)
async def get_lyrics(
    song_id: str,
    source: str,
    force_refresh: bool = Query(default=False)
):
    return await manager.get_lyrics(song_id=song_id, source_name=source, force_refresh=force_refresh)


@router.get("/search")
async def search_songs(track: str, artist: str):
    print("Search songs")
    return await manager.search_songs(track, artist)


@router.post("/lyrics/add")
async def add_custom_lyrics(lyrics: LyricsData):
    if not lyrics.song_id or not lyrics.title:
        raise HTTPException(status_code=400, detail="song_id and title are required.")

    source = lyrics.source or "manual"

    # Optional: skip overwrite if it already exists
    existing = await LyricsCache.get_cached_lyrics(source, lyrics.song_id)
    if existing:
        raise HTTPException(status_code=409, detail="Lyrics already exist for this song_id + source.")

    await LyricsCache.set_cached_lyrics(source, lyrics.song_id, lyrics.dict())
    return {"message": "Lyrics saved successfully"}