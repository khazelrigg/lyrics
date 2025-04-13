from pydantic import BaseModel
from typing import Optional, List, Dict

class LyricsLine(BaseModel):
    text: str
    start_time: Optional[int] = 0

class LyricsData(BaseModel):
    song_id: str
    title: str
    artist: str
    album: Optional[str] = "Unknown"
    lines: List[LyricsLine]
    synced: Optional[bool] = False
    language: Optional[str] = None
    media: Optional[Dict] = None
    source: Optional[str] = None
    url: Optional[str] = None
