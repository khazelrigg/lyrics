"""
An abstract class for interacting with different Lyrics Sources
"""
from abc import ABC, abstractmethod

from app.models.lyrics import LyricsData

#from lyrics_socket.lyrics_data import LyricsData, LyricsLine

class LyricsSource(ABC):
    """
    An abstract class for interacting with different Lyrics Sources.
    This class defines the interface for retrieving song information and lyrics.
    """

    @abstractmethod
    async def get_songs(self, title, artist):
        """Returns a list of songs matching the query.
        Returns:
            list[dict]: A list of song information dictionaries, containing the following keys:
                - song_id (str): The unique identifier of the song.
                - title (str): The title of the song.
                - artist (str): The artist of the song.
                - url (str): URL to a song's page if available.
                - icon (str): The icon configuration for the source.
        """
        # TODO Relocate/redo icons - only client side?
        return None

    @abstractmethod
    async def get_lyrics(self, song_id) -> LyricsData:
        """Returns a LyricsData container for the specified song. """
        return None
