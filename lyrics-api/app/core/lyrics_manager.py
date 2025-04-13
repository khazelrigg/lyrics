"""_summary_
Single source for fetching lyrics. Manages multiple lyrics sources and caches results.
"""

import logging
from collections import deque

#from lyrics_socket.config import (
#    GENIUS_CONFIG,
#    MAX_LYRICS_CACHE_SIZE,
#    MAX_SONGS_CACHE_SIZE,
#)


from app.services.spotify import SpotifyLyricsSource
from app.services.genius import GeniusLyricsSource
from app.services.uta_net import UtaNetLyricsSource
from app.services.lyrics_translate import LyricsTranslateLyricsSource
from app.services.elyrics import eLyricsLyricsSource

from app.db.cache import LyricsCache

from app.models.lyrics import LyricsData, LyricsLine

class LyricsManager:
    """
    Manages multiple lyrics sources and coordinates lyrics searches.
    Handles authentication, source enabling/disabling, and result aggregation.
    """


    def __init__(self):
        """
        Initialize the lyrics manager and configure lyrics sources.
        Reads Genius API credentials from configuration files.
        """
        self.logger = logging.getLogger("LyricsManager")
        self.logger.info("New LyricsManager instance started.")

        # Initialize sources
        self.sources = {
            "SpotifyLyricsSource": SpotifyLyricsSource(),
            "GeniusLyricsSource": GeniusLyricsSource(),
            "UtaNetLyricsSource": UtaNetLyricsSource(),
            "LyricsTranslateSource": LyricsTranslateLyricsSource(),
            "eLyricsSource": LyricsTranslateLyricsSource()
        }

        # Default states
        self.enabled_sources = {
            "SpotifyLyricsSource": False,
            "GeniusLyricsSource": True,
            "UtaNetLyricsSource": True,
            "LyricsTranslateSource": True,
            "eLyricsSource": False,
        }

        # Setup the server session cache
        self.MAX_LYRICS_CACHE_SIZE = 100
        self.MAX_SONGS_CACHE_SIZE = 100

        self.current_track_key = str
        self.lyrics_cache = {}
        self.lyrics_cache_order = deque(maxlen=self.MAX_LYRICS_CACHE_SIZE)
        self.search_cache = {}
        self.search_cache_order = deque(maxlen=self.MAX_SONGS_CACHE_SIZE)

    async def search_songs(self, track: str, artist: str) -> list:
        """
        Search for matching songs across all enabled sources.

        Args:
            track (str): The song title to search for
            artist (str): The artist name to search for

        Returns:
            list: Combined search results from all enabled sources
        """
        self.logger.info("Searching songs: %s by %s", track, artist)
        self.logger.info("Enabled sources: %s", self.enabled_sources)
        print(f"Enabled sources: %s", self.enabled_sources)

        current_sources = frozenset(self.get_enabled_sources())

        # Check the cache
        cached = await LyricsCache.get_cached_search(track, artist, current_sources)
        if cached:
            self.logger.info("Search cache hit")
            print("Cache hit")
            return cached

        results = []

        for source_name, source in self.sources.items():
            if self.enabled_sources[source_name]:
                self.logger.info("Searching %s for %s", source_name, track)

                source_results = await source.get_songs(track, artist)
                self.logger.info("Source search results: %s", source_results)
                # Add the source name to tracks
                for result in source_results:
                    result["source"] = source_name
                    self.logger.info(
                        "Got %s song results from %s", len(source_results), source_name
                    )
                results.extend(source_results)

        # Cache our results
        song_count = len(results)

        await LyricsCache.set_cached_search(track, artist, current_sources, results)
        self.logger.debug(
            "Cached %d songs for %s by %s @ %s", song_count, track, artist
        )

        self.logger.info("Found %d songs for %s by %s", song_count, track, artist)
        return results

    async def get_lyrics(self, song_id: str, source_name: str) -> LyricsData:
        """
        Fetch lyrics for a specific song from the specified source.

        Args:
            song_id (str): Unique identifier for the song
            source_name (str): Name of the source to fetch lyrics from

        Returns:
            str: The lyrics text if found, error message if not found
        """

        self.logger.debug("Getting lyrics for %s from %s", song_id, source_name)
        self.logger.debug("Enabled sources: %s", self.enabled_sources)

        # Check the cache first
        cache_key = f"{source_name}_{song_id}"
        cached = await LyricsCache.get_cached_lyrics(source_name, song_id)
        if cached:
            self.logger.debug("Cache has lyrics: %s from %s", song_id, source_name)
            print("Lyrics from cache")
            return LyricsData(**cached)

        # Fetch lyrics from the source
        lyrics = await self.sources[source_name].get_lyrics(song_id)

        # Cache our results
        if lyrics:
            await LyricsCache.set_cached_lyrics(source_name, song_id, lyrics.dict())
        self.logger.debug("Cached lyrics: %s from %s", song_id, source_name)
        #self.logger.debug("Song lyrics: %s", lyrics)

        return lyrics

    def toggle_source(self, source_name: str) -> bool:
        """
        Toggle a specific lyrics source.

        Args:
            source_name (str): Name of the source to toggle

        Returns:
            bool: True if source was toggled, False if source not found
        """
        if source_name in self.enabled_sources:
            self.enabled_sources[source_name] = not self.enabled_sources[source_name]
            status = "enabled" if self.enabled_sources[source_name] else "disabled"
            self.logger.debug("%s set to %s", source_name, status)
            return True
        return False

    def set_source_status(self, source_name: str, status: bool) -> bool:
        """
        Enable or disable a specific lyrics source.

        Args:
            source_name (str): Name of the source
            status (bool): True to enable, False to disable

        Returns:
            bool: True if source was toggled, False if source not found
        """
        if source_name in self.enabled_sources:
            self.enabled_sources[source_name] = status
            status = "enabled" if self.enabled_sources[source_name] else "disabled"
            self.logger.debug("%s was set to %s", source_name, status)
            return status
        return False

    def get_enabled_sources(self) -> list:
        """
        Get list of currently enabled lyrics sources.

        Returns:
            list: Names of enabled sources
        """
        return [name for name, enabled in self.enabled_sources.items() if enabled]
