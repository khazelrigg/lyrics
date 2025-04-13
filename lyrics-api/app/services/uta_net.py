"""_summary_
Class for interacting with Uta-Net, a Japanese lyrics website.
Provides functionality to search for songs and retrieve their lyrics.
"""
import asyncio

import logging
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup

from app.core.config import REQUEST_CONFIG, SOURCE_CONFIG
from app.core.config import SPOTIFY_CONFIG
from app.models.lyrics import LyricsData, LyricsLine
from app.core.lyrics_source import LyricsSource

class UtaNetLyricsSource(LyricsSource):
    """
    A lyrics source implementation for Uta-Net, a Japanese lyrics website.
    Provides functionality to search for songs and retrieve their lyrics.
    """

    BASE_URL = "https://www.uta-net.com"
    SEARCH_URL = f"{BASE_URL}/search/"
    SONG_URL = f"{BASE_URL}/song/"
    ICON_PATH = SOURCE_CONFIG["uta_net_icon"]

    def __init__(self):
        self.logger = logging.getLogger("UtaNetLyricsSource")

        self.headers = {
            "User-Agent": REQUEST_CONFIG["user_agent"],
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
        }


    async def get_songs(self, title, artist):
        """
        Search for songs on Uta-Net using the provided query.

        Args:
            query (str): The search query string, typically song title or artist name

        Returns:
            list: List of dictionaries containing song information with keys:
                - title: Song title
                - artist: Artist name
                - url: Full URL to the song page
                - icon: Path to the source icon
                - song_id: Unique identifier for the song
        """

        try:
            query = f"{title}"
            encoded_title = quote(query)
            search_url = f"{self.SEARCH_URL}?Keyword={encoded_title}&Aselect=2&Bselect=3"
            self.logger.info("Searching for songs on Uta-Net with query: %s", query)

            response = requests.get(search_url, headers=self.headers, timeout=REQUEST_CONFIG["timeout"])

            if response.status_code != 200:
                self.logger.error("Failed to fetch search results from Uta-Net. Status code: %s", response.status_code)
                return []

            soup = BeautifulSoup(response.text, "html.parser")
            song_table = soup.find("table", class_="songlist-table")

            if not song_table:
                self.logger.error("Failed to fetch search results from Uta-Net. No song results table found.")
                return []

            songs = []
            for row in song_table.find("tbody").find_all("tr"):
                try:
                    song_link_tag = row.find("a", class_="py-2 py-lg-0")
                    if song_link_tag:
                        song_title = song_link_tag.text.strip()
                        song_link = "https://www.uta-net.com" + song_link_tag["href"]
                        artist_tag = row.find_all("td")[1].find("a")
                        artist_name = artist_tag.text.strip() if artist_tag else "Unknown Artist"
                        songs.append({
                            "title": song_title,
                            "artist": artist_name,
                            "url": song_link,
                            "icon": self.ICON_PATH,
                            "song_id": song_link.split("https://www.uta-net.com/song/")[1][:-1]
                        })
                except (IndexError, KeyError, AttributeError) as e:
                    self.logger.error("Error parsing song row: %s", str(e))
                    continue

            self.logger.info("Found %d songs on Uta-Net", len(songs))
            return songs

        except requests.Timeout:
            self.logger.error("Request timed out while searching songs")
            return []
        except requests.RequestException as e:
            self.logger.error("Network error while searching songs: %s", str(e))
            return []
        except Exception as e: #pylint: disable=broad-except
            self.logger.error("Unexpected error while searching songs: %s", str(e))
            return []


    async def get_lyrics(self, song_id):
        """
        Fetches lyrics for the specified song ID from the uta-net.com website.

        Args:
            song_id (str): The unique identifier for the song.

        Returns:
            str: The lyrics for the song, or None if the lyrics could not be fetched.
        """

        try:
            self.logger.debug("Getting lyrics for song ID: '%s'", song_id)


            if not str(song_id).isdigit():
                self.logger.error("Invalid song ID: '%s'", song_id)
                return None

            song_url = f"{self.SONG_URL}{song_id}"

            # Send request to the lyrics page
            response = requests.get(song_url, headers=self.headers, timeout=REQUEST_CONFIG["timeout"])
            if response.status_code != 200:
                self.logger.error("Error getting lyrics for song ID: '%s'", song_id)
                return None

            soup = BeautifulSoup(response.text, "html.parser")
            lyrics_div = soup.find("div", id="kashi_area")

            # Extract album link
            album_link_tag = soup.find("a", string="アルバム一覧")
            album_link = album_link_tag["href"] if album_link_tag else None
            if album_link:
                album_link = f"{self.BASE_URL}{album_link}"  # Ensure full URL
                self.logger.info("Album link found: %s", album_link)
            album_name = await self.get_album_name(album_link, song_id)
            album_name = "Unknown" if album_name is None else album_name
            self.logger.info("Album name: %s", album_name)

            # Extract Song Title using CSS Selector
            song_title_tag = soup.select_one(
                "html body.moviesong div.container-xl div#kashi-page.row.justify-content-left.mt-lg-5 div#left-contents.main.col-sm-12.col-lg-8.flex-grow-1.ms-lg-3 div.row div.col-12.song-infoboard div.blur-filter.row.py-3 h2"
            )
            song_title = song_title_tag.text.strip() if song_title_tag else None

            # Extract Artist Name using itemprop
            artist_tag = soup.find("span", itemprop="byArtist name")
            artist_name = artist_tag.text.strip() if artist_tag else "ERROR"

            # Extract Thumbnail
            thumbnail_tag = soup.find("div", class_="sp-jacket")
            if not thumbnail_tag:
                thumbnail_tag = soup.find("div", class_="pc-jacket")  # Fallback for desktop view
            thumbnail_img = thumbnail_tag.find("img") if thumbnail_tag else None
            artwork_url = thumbnail_img["src"] if thumbnail_img else None


            if not lyrics_div:
                self.logger.debug("No lyrics found for song ID: '%s'", song_id)
                return None

            lyrics_lines = []
            lyrics = ""
            last_element = None

            for element in lyrics_div.descendants:
                if element.name == "br":
                    if last_element.name == "br":
                        lyrics_lines.append(LyricsLine(text="", start_time=0))
                    #lyrics += "\n"
                    #lyrics_lines.append(LyricsLine(""))
                    #lyrics += "\n"
                elif isinstance(element, str):
                    # Clean up the text by removing extra spaces and newlines
                    line_text = element.strip()
                    lyrics_lines.append(LyricsLine(text=line_text, start_time=0))
                    lyrics += element
                last_element = element

            #cleaned_lyrics = lyrics.strip()


            results = LyricsData(
                song_id=song_id,
                title=song_title,
                artist=artist_name,
                album=album_name,
                url=song_url,
                lines=lyrics_lines,
                synced=False,
                language="JP",
                source="uta-net.com",
                media={"thumbnail": artwork_url},
            )

            return results

            if len(lyrics) > 0:
                return lyrics;

            if cleaned_lyrics:
                return {"synced": False, "lyrics": cleaned_lyrics}

            return None

        except requests.Timeout:
            self.logger.error("Request timed out while fetching lyrics")
            return None
        except requests.RequestException as e:
            self.logger.error("Network error while fetching lyrics: %s", str(e))
            return None
        except Exception as e: #pylint: disable=broad-except
            self.logger.error("Unexpected error while fetching lyrics: %s", str(e))
            return None

    async def get_album_name(self, album_page_url, song_id):
        """
        Fetches the album name containing the specified song from the album page.

        Args:
            album_page_url (str): URL of the album page.
            song_title (str): Title of the song.

        Returns:
            str: The album name containing the song, or None if not found.
        """
        try:
            # Fetch the artist album songs page
            response = requests.get(album_page_url, headers=self.headers, timeout=REQUEST_CONFIG["timeout"])
            if response.status_code != 200:
                self.logger.error(f"Failed to fetch album page: {album_page_url}")
                return None

            # Get page HTML
            soup = BeautifulSoup(response.text, "html.parser")
            albums = soup.find_all("table", class_="album_table")  # Get each album


            for album in albums:
                # Extract album name
                album_name_tag = album.find("div", class_="album_title").find("a")
                album_name = album_name_tag.text.strip() if album_name_tag else None

                # Extract song links
                song_links = album.find("ul", class_="album_songs").find_all("a", href=True)

                # Check if the song ID exists in the song links
                for song in song_links:
                    #print("Comparing against %s with %s", song["href"], f"/song/{song_id}/")
                    if f"/song/{song_id}/" in song["href"]:
                        return album_name

            self.logger.info("Song '%s' not found in any album on the page.", song_id)
            return None

        except requests.Timeout:
            self.logger.error("Request timed out while fetching the album page")
            return None
        except requests.RequestException as e:
            self.logger.error("Network error while fetching album page: %s", str(e))
            return None
        except Exception as e:
            self.logger.error("Unexpected error while fetching album name: %s", str(e))
            return None