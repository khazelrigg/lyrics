"""_summary_
Class for interacting with Spotify and the musixmatch lyrics
Provides functionality to retrieve song lyrics.
"""

import logging
from typing import Optional

import requests
import aiohttp

#from lyrics_socket.config import SOURCE_CONFIG, SPOTIFY_CONFIG, USE_MOCK_API
#from lyrics_socket.media_source.spotify_media_source import SpotifyMediaSource

from app.core.config import SPOTIFY_CONFIG
from app.models.lyrics import LyricsData, LyricsLine
from app.core.lyrics_source import LyricsSource

class SpotifyLyricsSource(LyricsSource):
    """
    Provides an interface to fetch song lyrics from the Spotify API.

    The `SpotifyLyricsSource` class is responsible for:
    - Initializing the Spotify media source and the Spotify API client.
    - Fetching the currently playing song from the current Spotify playback device
    - Fetching lyrics for a given song ID and returning the lyrics in a structured format.
    """

    def __init__(self):
        self.logger =  logging.getLogger("SpotifyLyricsSource")


    async def fetch_lyrics_from_local_api(self, song_id: str) -> Optional[dict]:
        """
        Sends an async GET request to the local API with the given Spotify URL
        and returns the JSON response.
        """
        #endpoint = "localhost:9000/?trackid=" + song_id
        endpoint = "https://spotify-lyrics-api-woad.vercel.app/?trackid=" + song_id
        #params = {"trackid": song_id}

        print("Getting lyrics from Spotify lyrics API")

        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(endpoint) as response:
                #async with session.get(endpoint, params=params) as response:
                    response.raise_for_status()

                    print("Response received from local API")
                    print(response)
                    return await response.json()
            except aiohttp.ClientError as e:
                print(f"Request failed: {e}")
                return None


    async def get_songs(self, title: str, artist: str):
        """
        Since Spotify doesn't allow open searching, this just returns a stub result
        assuming the frontend has already looked up the track via the Spotify Web API.
        """
        return []  # frontend handles search or provides metadata


    async def get_lyrics(self, song_id: str) -> Optional[dict]:
        """
        Fetches the lyrics for the given song ID from the Spotify API.

        Args:
            song_id (str): The unique identifier of the song.

        Returns:
            LyricsData: The lyrics data for the given song ID.
        """

        try:
            album_name = ""
            thumbnail_url = ""

            self.logger.info("Fetching lyrics for song ID: %s", song_id)
            #current_song = await self.spotify_media_source.get_track(song_id)
            #self.logger.info("Got track info for song: %s", current_song)
            #self.logger.info("TracK: %s - Artist: %s - Album %s", current_song["name"], current_song["artists"][0]["name"], current_song["album"]["name"])

            #TODO - We need to replace syrics with our  syrics API that uses GET calls and returns JSON


            # TODO , we need to use trackId to lookup the track info (title/artist/album)
            # Example, call like http://localhost:8000/?trackid=lw6mQVWRFVgBRvB?si=26eaf02eb63a4e68

            response = await self.fetch_lyrics_from_local_api(song_id)



            print("Syrics API returned a response: %s", response)
            #print(syrics_api_response)

            if response is None or "lines" not in response:
                self.logger.warning("No lyrics found for song: %s. Returning None.", song_id)
                #return None
                result = LyricsData(
                    song_id=song_id,
                    title="",#current_song["name"],
                    artist="",#current_song["artists"][0]["name"],
                    album=album_name,
                    lines=[LyricsLine(text="No lyrics found from Spotify", start_time=0)],
                    synced=False,
                    language="en",
                    media={
                        "thumbnail": thumbnail_url
                    },
                    source="Spotify",
                    url="",#current_song["external_urls"]["spotify"]
                )
                print(result)
                return result

            is_synced = response["syncType"] == "LINE_SYNCED"
            print("Is synced:", is_synced)

            #if response_lyrics["syncType"] == "LINE_SYNCED":

            lines = response["lines"]
            lyrics_lines = []
            processed_lyrics = []

            for line in lines:
                lyrics_lines.append(LyricsLine(
                    text=line["words"],
                    start_time=line["startTimeMs"]
                ))
                print(line)
                processed_lyrics.append({
                    "text": line["words"],
                    "startTimeMs": int(line["startTimeMs"]) if line["startTimeMs"] else None
                })

            print("Read lines from the response: ", lyrics_lines)

            return LyricsData(
                song_id=song_id,
                title="",#current_song["name"],
                artist="",#current_song["artists"][0]["name"],
                album=album_name,
                lines=lyrics_lines,
                synced=is_synced,
                language=response.get("language"),
                media={
                    "thumbnail": thumbnail_url
                },
                source="Spotify",
                url="",#current_song["external_urls"]["spotify"]
            )

            #return {"synced": is_synced, "lyrics": processed_lyrics}
            #else:
            #    return {"synced": False, "lyrics": response["lyrics"]}

        except Exception as e: #pylint: disable=broad-except
            self.logger.error("Error fetching lyrics from Spotify: %s", str(e))
            return None#

