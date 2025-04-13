"""_summary_
Class for interacting with Uta-Net, a Japanese lyrics website.
Provides functionality to search for songs and retrieve their lyrics.
"""
import asyncio
import logging
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup

#from lyrics_socket.utils import remove_suffix

from app.utils.helpers import remove_suffix
from app.core.config import REQUEST_CONFIG, SOURCE_CONFIG
from app.models.lyrics import LyricsData, LyricsLine
from app.core.lyrics_source import LyricsSource

class LyricsTranslateLyricsSource(LyricsSource):
    BASE_URL = "https://lyricstranslate.com"
    SEARCH_URL = f"{BASE_URL}/en/songs"
    SONG_URL = f"{BASE_URL}/song/"
    ICON_PATH = SOURCE_CONFIG["lyricstranslate_icon"]

    def __init__(self):
        self.logger = logging.getLogger("LyricsTranslateSource")

        self.headers = {
            "User-Agent": REQUEST_CONFIG["user_agent"],
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
        }


    async def get_songs(self, title, artist):
        """
        Search for songs on Lyrics Translate

        Args:
            title (str): Song title
            artist (str): Artist name

        Returns:
            list: List of dictionaries containing song information with keys:
                - title: Song title
                - artist: Artist name
                - url: Full URL to the song page
                - icon: Path to the source icon
                - song_id: Unique identifier for the song
        """
        #if USE_MOCK_API:
        #    return generate_fake_song_list("lyrics_translate")

        try:
            encoded_title = quote(title)
            if artist is None or artist == "":
                self.logger.warning("Artist not provided. Using '0' as artist.")
                artist = "0"

            encoded_artist = quote(artist)
            search_lang = "0" # Search lang: 0 is any, 328 = en, 31 = jp. Can combine: 328-31

            # number 0 can be changed for different languages
            search_url = f"{self.SEARCH_URL}/{search_lang}/{encoded_artist}/{encoded_title}"
            self.logger.info("Searching for songs on Lyrics Translate: '%s' by '%s'", title, artist)
            self.logger.info("Song Search URL: %s", search_url)

            response = requests.get(search_url, headers=self.headers, timeout=REQUEST_CONFIG["timeout"])

            if response.status_code != 200:
                self.logger.error("Failed to fetch search results from Lyrics Translate. Status code: %s", response.status_code)
                return []
        #
            soup = BeautifulSoup(response.text, "html.parser")
            song_table = soup.find("div", class_="ltsearch-results-line")


            if not song_table:
            #  TODO - CHANGE TO CHECK FOR EMPTY   self.logger.error("Failed to fetch search results from Lyrics Translate. No song results table found."
                self.logger.error("Failed to fetch search results from LyricsTable. No song results table found.")
                return []

            self.logger.info("Found a songs table")

            rows = song_table.find_all(class_="d-tr")
            self.logger.debug("Found %s rows", len(rows))

            songs = []
            for row in rows:
                try:
                    # Check if the row has the class 'd-header'
                    if 'd-header' in row.get('class', []):
                        self.logger.debug("Skipping header row")
                        continue

                    #SONG COLUMN
                    song_img = row.find("div", class_="s-av").find("img")
                    song_img_url = song_img["src"]

                    song_info = row.find("div", class_="s-s")
                    song_title_a = song_info.find("div", class_="stt").find("a")
                    song_title = song_title_a.text.strip()
                    song_url = self.BASE_URL + song_title_a["href"]
                    artist_name = song_info.find("div", class_="att").text.strip()

                    self.logger.info("Found song: %s by %s", song_title, artist_name)
                    self.logger.info("Song URL: %s", song_url)

                    songs.append({
                        "title": song_title,
                        "artist": artist_name,
                        "url": song_url,
                        "icon": song_img_url, #SELF.icon_path,
                        "song_id": song_url #TODO SEE IF BETTER OPTION
                    })
                except (IndexError, KeyError, AttributeError) as e:
                    self.logger.error("Error parsing song row: %s", str(e))
                    continue

            self.logger.info("Found %d songs on LyricsTranslate.com", len(songs))
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
            song_id (str): The unique identifier for the song (in this case the lyrics page URL).

        Returns:
            str: The lyrics for the song, or None if the lyrics could not be fetched.
        """
        #if USE_MOCK_API:
        #    return generate_fake_LyricsData("uta-net", song_id, lang="jp")

        try:
            self.logger.debug("Getting lyrics for song ID: '%s'", song_id)

            print("songs id", song_id)
            song_url = song_id

            # Send request to the lyrics page
            response = requests.get(song_url, headers=self.headers, timeout=REQUEST_CONFIG["timeout"])
            if response.status_code != 200:
                self.logger.error("Error getting lyrics at: '%s'", song_id)
                return None

            soup = BeautifulSoup(response.text, "html.parser")
            lyrics_div = soup.find("div", id="song-body")
            if not lyrics_div:
                self.logger.error("No lyrics div found for song ID: '%s'", song_id)
                return None


            self.logger.info("Found lyrics div for song ID: '%s'", song_id)
            album_name = "Unknown"

            # Extract Song Title using CSS Selector
            song_title = soup.select_one("#song-title > h2:nth-child(1)")
            if song_title:
                print("Song title:", song_title)
                #self.logger.info(song_title)
                song_title_text = song_title.get_text(strip=True)
                song_title_text = remove_suffix(song_title_text, " lyrics")
                self.logger.info("Song Title: %s", song_title_text)#, song_title)
            else:
                self.logger.error("Error getting song title for song ID: '%s'", song_id)

            # Extract Artist Name using itemprop
            header = soup.find("div", class_="song-node-infoline")
            artist = header.select_one(".song-node-info-artist")
            artist_name = artist.find("div", class_="artist-title").find("a").text.strip()


            #artist_thumb = artist.find("a").attrs.get("href")
            #self.logger.info("Artist Thumb: '%s'", artist_thumb)

            #artist_name = artist.get_text(strip=True) if artist else None
            self.logger.info("Artist: '%s'", artist_name)
            print("artist: ", artist_name)

            lyrics_lines = []
            last_element = None

            paragraphs = lyrics_div.find_all("div", class_="par")
            self.logger.debug("Found %s paragraphs", len(paragraphs))

            for par in paragraphs:
                # Copy lines inside paragaph
                for line in par.find_all("div"):
                    self.logger.info("Found line: '%s'", line.text.strip())
                    line_text = line.text.strip()
                    if line_text:
                        lyrics_lines.append(LyricsLine(text=line_text, start_time=0))
                # Blank line at end of Paragraph
                        print(line_text)
                self.logger.info("End paragraph")
                lyrics_lines.append(LyricsLine(text="", start_time=0))

            print("lyrics_lines: ", lyrics_lines)

            results = LyricsData(
                song_id=song_id,
                title=song_title_text,
                artist=artist_name,
                album=album_name,
                lines=lyrics_lines,
                synced=False,
                language="JP",
                source="lyricstranslate.com",
                url=song_url,
                media={"thumbnail": None},
            )

            return results

        except requests.Timeout:
            self.logger.error("Request timed out while fetching lyrics")
            return None
        except requests.RequestException as e:
            self.logger.error("Network error while fetching lyrics: %s", str(e))
            return None
        except Exception as e: #pylint: disable=broad-except
            self.logger.error("Unexpected error while fetching lyrics: %s", str(e))

async def test_song_search_1():
    """Test the song search functionality."""
    source = LyricsTranslateLyricsSource()
    results = await source.get_songs("ダーリン", "FAKY")
    print("results: ", results)
    assert len(results) == 1
    assert all(key in results[0] for key in ["title", "artist", "url", "song_id", "icon"])

async def test_song_search_2():
    """Test the song search functionality."""
    source = LyricsTranslateLyricsSource()
    results = await source.get_songs("ダーリン", "")
    assert len(results) > 0
    assert all(key in results[0] for key in ["title", "artist", "url", "song_id", "icon"])

async def test_get_lyrics():
    """Test the get_lyrics functionality."""
    source = LyricsTranslateLyricsSource()
    results = await source.get_lyrics("https://lyricstranslate.com/en/faky-darlin-lyrics.html")
    print("results: ", results)
    print(results.title)
    assert results and isinstance(results, LyricsData)
    assert results.title == "ダーリン (prod. GeG)"
    assert results.artist == "FAKY"

async def test_get_search_lyrics():
    """Test the get_lyrics functionality."""
    source = LyricsTranslateLyricsSource()
    results = await source.get_songs("川の流れのように", "")
    first_songs = results[0]
    lyrics = await source.get_lyrics(first_songs["url"])
    assert lyrics and isinstance(lyrics, LyricsData)
    assert lyrics.title == "川の流れのように"
    assert lyrics.lines[0].text == "知らず知らず　歩いて来た"

async def test():
    #await test_song_search_1()
    #await test_get_lyrics()
    await test_get_search_lyrics()
    #
    # await test_song_search_2()


# Test functions
#if __name__ == "__main__":
#    logging.basicConfig(level=logging.DEBUG)
#    asyncio.run(test())