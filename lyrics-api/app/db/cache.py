# app/db/cache.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, Text, select, PrimaryKeyConstraint

import json

DATABASE_URL = "sqlite+aiosqlite:///./lyrics_cache.db"

engine = create_async_engine(DATABASE_URL, echo=False)
Base = declarative_base()
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class LyricsCacheEntry(Base):
    __tablename__ = "lyrics_cache"
    source = Column(String, primary_key=True)
    song_id = Column(String, primary_key=True)
    data = Column(Text)

class SearchCacheEntry(Base):
    __tablename__ = "search_cache"
    track = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    sources = Column(String, nullable=False)  # Comma-separated
    data = Column(Text, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("track", "artist", "sources"),
    )

class LyricsCache:
    """ To store our lyrics in a simple cache database for future use """
    @staticmethod
    async def init_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    @staticmethod
    async def get_cached_lyrics(source: str, song_id: str):
        async with SessionLocal() as session:
            result = await session.execute(
                select(LyricsCacheEntry).where(
                    LyricsCacheEntry.source == source,
                    LyricsCacheEntry.song_id == song_id,
                )
            )
            entry = result.scalar_one_or_none()
            if entry:
                return json.loads(entry.data)
            return None

    @staticmethod
    async def set_cached_lyrics(source: str, song_id: str, lyrics_data: dict):
        async with SessionLocal() as session:
            entry = LyricsCacheEntry(
                source=source,
                song_id=song_id,
                data=json.dumps(lyrics_data)
            )
            await session.merge(entry)  # insert or update
            await session.commit()

    @staticmethod
    async def get_cached_search(track: str, artist: str, sources: list[str]):
        async with SessionLocal() as session:
            key = ",".join(sorted(sources))  # consistent ordering
            result = await session.execute(
                select(SearchCacheEntry).where(
                    SearchCacheEntry.track == track,
                    SearchCacheEntry.artist == artist,
                    SearchCacheEntry.sources == key,
                )
            )
            entry = result.scalar_one_or_none()
            if entry:
                return json.loads(entry.data)
            return None

    @staticmethod
    async def set_cached_search(track: str, artist: str, sources: list[str], results: list[dict]):
        async with SessionLocal() as session:
            key = ",".join(sorted(sources))
            entry = SearchCacheEntry(
                track=track,
                artist=artist,
                sources=key,
                data=json.dumps(results)
            )
            await session.merge(entry)
            await session.commit()
