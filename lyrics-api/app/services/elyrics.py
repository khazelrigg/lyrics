"""_summary_
Class for interacting with Uta-Net, a Japanese lyrics website.
Provides functionality to search for songs and retrieve their lyrics.
"""
import asyncio
import logging
from urllib.parse import quote, urlencode

import zstandard as zstd
import requests
import brotli
import zlib

from bs4 import BeautifulSoup

from app.utils.helpers import remove_suffix
from app.core.config import REQUEST_CONFIG, SOURCE_CONFIG
from app.models.lyrics import LyricsData, LyricsLine
from app.core.lyrics_source import LyricsSource

class eLyricsLyricsSource(LyricsSource):
    BASE_URL = "https://elyrics.net"
    SEARCH_URL = f"{BASE_URL}/find.php"
    SONG_URL = f"{BASE_URL}/song/"
    ICON_PATH = SOURCE_CONFIG["elyrics_icon"]



    def __init__(self):
        self.logger = logging.getLogger("eLyricsSource")

        self.headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                # 'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://www.elyrics.net',
                'DNT': '1',
                'Sec-GPC': '1',
                'Connection': 'keep-alive',
                'Referer': 'https://www.elyrics.net/find.php',
                # 'Cookie': 'crs_ELYRICS_NET=blah',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Priority': 'u=0, i',
                # Requests doesn't support trailers
                # 'TE': 'trailers',
            }

        self.cookies = {
                'crs_ELYRICS_NET': 'blah',
            }

    async def get_songs(self, title, artist):
        """
        Search for songs on eLyrics.net

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
            self.logger.info("Searching for songs on eLyrics.net: '%s' by '%s'", title, artist)

            data = f"q={title} {artist}"
            self.logger.info("Data: %s", data)

            response = requests.post('https://www.elyrics.net/find.php', cookies=self.cookies, headers=self.headers, data=data, timeout=REQUEST_CONFIG["timeout"])

            content_encoding = response.headers.get("Content-Encoding")
            self.logger.info("Content Encoding: %s", content_encoding)
            html_content = self.decompress_content(response.content, content_encoding)

            #Convert to string
            #self.logger.info("Search Success! Response text: %s", html_content)


            soup = BeautifulSoup(html_content, "html.parser")
            with open("scraper.html", "w") as f:
                f.write(html_content)

            # URGENT
            # TODO - If there is an iframe, need to use selenium to extract the iframe google search content
            #song_list = soup.find("div", class_="inner_right")
            #iframe = song_list.find("iframe")
            #if iframe:
            #    self.logger.info("Found embedded iframe for lyrics search")
            #    self.logger.info("Iframe URL: %s", iframe["src"])
            #    search_url = f"https://www.elyrics.net/inc/google_cse.html?q={title} {artist}"
            #    response = requests.get(search_url, headers=self.headers, timeout=REQUEST_CONFIG["timeout"])
            #    if response.status_code == 200:
            #        subpage_content = self.decompress_content(response.content, response.headers.get("Content-Encoding"))
            #        self.logger.info("Iframe Content: %s", subpage_content)
            #        return []
#
            #    iframe_url = iframe["src"]
#
            #    iframe_response = requests.get(f"https://www.elyrics.net{iframe_url}", headers=self.headers, cookies=self.cookies, timeout=REQUEST_CONFIG["timeout"])
            #    self.logger.info("Iframe Response Status Code: %s", iframe_response.status_code)
            #    self.logger.warn("Iframe content: %s", iframe_response.content)
#
            #    if iframe_response.status_code == 200:
            #        iframe_content = self.decompress_content(iframe_response.content, iframe_response.headers.get("Content-Encoding"))
            #        self.logger.info("Iframe Content: %s", iframe_content)
            #        iframe_soup = BeautifulSoup(iframe_content, "html.parser")
            #        with open("scraper.html", "w") as f:
            #            f.write(iframe_content)

            # Find all song item divs
            song_items = song_list.find_all("div", style="text-align:left;padding:10px 0 10px 0;")

            songs = []

            # Extract title, artist, and URL from each song item
            for song_item in song_items:
                # Extract the <a> tag
                link_tag = song_item.find("a")
                if link_tag:
                    # Extract the URL
                    url = link_tag["href"]
                    full_url = f"https://www.elyrics.net{url}"  # Make it an absolute URL

                    # Extract the title and artist
                    full_text = link_tag.get_text(" ", strip=True)
                    if "LYRICS -" in full_text:
                        title_artist_split = full_text.split(" LYRICS - ")
                        title = title_artist_split[0]
                        artist = title_artist_split[1] if len(title_artist_split) > 1 else "Unknown"
                    else:
                        title = full_text
                        artist = "Unknown"

                    # Add the song data to the list
                    songs.append({
                        "song_id": full_url,
                        "title": title,
                        "artist": artist,
                        "url": full_url,
                        "icon": self.ICON_PATH
                    })

            self.logger.info("Found %d songs on eLyrics.net for %s", len(songs), data)
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
        #if USE_MOCK_API:
        #    return generate_fake_LyricsData("uta-net", song_id, lang="jp")

        try:
            self.logger.debug("Getting lyrics for song ID: '%s'", song_id)


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
                self.logger.info("End paragraph")
                lyrics_lines.append(LyricsLine(text="", start_time=0))

            results = LyricsData(
                song_id=song_id,
                title=song_title_text,
                artist=artist_name,
                album=album_name,
                status="OK",
                lines=lyrics_lines,
                synced=False,
                language="en",
                source="eLyrics.net",
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
            return None

    def decompress_content(self, content, encoding):
        """
        Decompresses the content based on the specified encoding.

        Args:
            content (bytes): The compressed content.
            encoding (str): The compression encoding.

        Returns:
            str: The decompressed content as a UTF-8 string.
        """
        try:
            # First, try to decode as plain UTF-8 without decompression
            self.logger.info("Attempting to decode content as plain UTF-8.")
            return content.decode('utf-8')
        except UnicodeDecodeError:
            self.logger.info("Content requires decompression.")

        try:
            if 'gzip' in encoding:
                self.logger.info("Decompressing gzip content.")
                decompressed = zlib.decompress(content, zlib.MAX_WBITS | 16)
            elif 'deflate' in encoding:
                self.logger.info("Decompressing deflate content.")
                decompressed = zlib.decompress(content)
            elif 'br' in encoding:
                self.logger.info("Decompressing Brotli content.")
                decompressed = brotli.decompress(content)
            elif 'zstd' in encoding:
                self.logger.info("Decompressing Zstandard content.")
                dctx = zstd.ZstdDecompressor()
                decompressed = dctx.decompress(content)
            else:
                self.logger.warning("Unknown encoding. Returning raw content.")
                decompressed = content

            return decompressed.decode('utf-8')
        except Exception as e:
            self.logger.error("Decompression failed: %s", e)
            raise

async def test_song_search_1():
    """Test the song search functionality."""
    source = eLyricsLyricsSource()
    results = await source.get_songs("ms fat booty", "")
    print("results: ", results)
    #assert len(results) == 1
    assert all(key in results[0] for key in ["title", "artist", "url", "song_id", "icon"])

async def test_song_search_2():
    """Test the song search functionality."""
    source = eLyricsLyricsSource()
    results = await source.get_songs("ダーリン", "")
    assert len(results) > 0
    assert all(key in results[0] for key in ["title", "artist", "url", "song_id", "icon"])

async def test_get_lyrics():
    """Test the get_lyrics functionality."""
    source = eLyricsLyricsSource()
    results = await source.get_lyrics("https://lyricstranslate.com/en/faky-darlin-lyrics.html")
    print("results: ", results)
    print(results.title)
    assert results and isinstance(results, LyricsData)
    assert results.title == "ダーリン (prod. GeG)"
    assert results.artist == "FAKY"

async def test_get_search_lyrics():
    """Test the get_lyrics functionality."""
    source = eLyricsLyricsSource()
    results = await source.get_songs("川の流れのように", "")
    first_songs = results[0]
    lyrics = await source.get_lyrics(first_songs["url"])
    assert lyrics and isinstance(lyrics, LyricsData)
    assert lyrics.title == "川の流れのように"
    assert lyrics.lines[0].text == "知らず知らず　歩いて来た"

async def test():
    await test_song_search_1()
    await test_song_search_2()
    #await test_get_lyrics()
    #await test_get_search_lyrics()
    #
    # await test_song_search_2()


# Test functions
if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    asyncio.run(test())