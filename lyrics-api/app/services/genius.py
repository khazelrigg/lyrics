"""_summary_
A lyrics source that fetches lyrics from Genius.com.
"""
# lyrics_sources/genius_lyrics_source.py

import logging
import urllib.parse

import requests
from bs4 import BeautifulSoup

#from lyrics_socket.lyrics_sources.mock_responses import MOCK_API, generate_fake_LyricsData, generate_fake_song_list
#from lyrics_socket.config import SOURCE_CONFIG, GENIUS_CONFIG, REQUEST_CONFIG, USE_MOCK_API

from app.core.config import GENIUS_CONFIG, REQUEST_CONFIG, SOURCE_CONFIG
from app.models.lyrics import LyricsData, LyricsLine
from app.core.lyrics_source import LyricsSource

#from lyrics_socket.lyrics_data import LyricsData, LyricsLine
#from .lyrics_source import LyricsSource

class GeniusLyricsSource(LyricsSource):
    """_summary_
    A lyrics source that fetches lyrics from Genius.com.
    """
    def __init__(self):
        self.logger = logging.getLogger("GeniusLyricsSource")

        # Load the API credentials
        #with open(GENIUS_CONFIG["client_id_file"], 'r', encoding="utf-8") as f:
        self.client_id = GENIUS_CONFIG["client_id"]
        #with open((GENIUS_CONFIG["client_secret_file"]), 'r', encoding="utf-8") as f:
        self.client_secret = GENIUS_CONFIG["client_secret"]
        #with open((GENIUS_CONFIG["access_token_file"]), 'r', encoding="utf-8") as f:
        access_token = GENIUS_CONFIG["access_token"]

        if access_token is None:
            self.logger.debug("No Genius access token provided. Attempting to acquire one...")
            access_token = self._get_genius_token()

        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "User-Agent": REQUEST_CONFIG["user_agent"],
        }

    async def get_songs(self, title, artist):
        query = f"{title} {artist}"
        encoded_search = urllib.parse.quote(query)
        search_url = f"https://api.genius.com/search?q={encoded_search}"

#TODO REENABLE:

        try:
            self.logger.debug("[Genius Lyrics] Searching for: '%s'", query)

            search_url = "https://api.genius.com/search"
            params = {"q": query}

            response_data = self._make_genius_request(search_url, params)
            # TODO - ERRORIX THIS - REMOVE
            #f = open("mock/genius_song_search.json", "w", encoding="utf-8")
            #f.write(str(response_data))

            #print(response_data)

            # Check for invalid response
            if "response" not in response_data or "hits" not in response_data["response"]:
                self.logger.error("Invalid response from Genius API")
                return []

            hits = response_data["response"]["hits"]
            songs = []

            for hit in hits:
                try:
                    result = hit["result"]
                    song_data = {
                        "song_id": result["id"],
                        "title": result["title"],
                        "artist": result["primary_artist"]["name"],
                        "url": result["url"],
                        "icon": SOURCE_CONFIG["genius_icon"]
                    }
                    songs.append(song_data)
                except KeyError as e:
                    self.logger.error("[Genius] Missing field in search response: %s", str(e))
            self.logger.debug("[Genius] Found %d songs for '%s'", len(songs), query)
            return songs

        except requests.Timeout:
            self.logger.error("[Genius] API request timed out during search")
            return []
        except requests.RequestException as e:
            self.logger.error("[Genius] Network error during search: %s", str(e))
            return []
        except ValueError as e:
            self.logger.error("[Genius] JSON decode error: %s", str(e))
            return []
        except Exception as e: #pylint: disable=broad-except
            self.logger.error("[Genius] Unexpected error during search: %s", str(e))
            return []

    async def get_lyrics(self, song_id):

        try:
            self.logger.debug("[Genius] Fetching lyrics for song ID: %s", song_id)
            song_url = f"https://api.genius.com/songs/{song_id}"

            response_json = self._make_genius_request(song_url)

            self.logger.info("[Genius] Fetched lyrics for song ID: %s\n%s", song_id, response_json)
            # Check for invalid response
            if "response" not in response_json or "song" not in response_json["response"]:
                self.logger.error("[Genius] Invalid song API response structure")
                return "Error: Invalid API response"

            song_info = self._parse_song_info(response_json)

            lyrics_path = response_json["response"]["song"]["path"]
            lyrics_url = f"https://genius.com{lyrics_path}"

            lyrics_page = requests.get(lyrics_url,
                                       headers=self.headers,
                                       timeout=REQUEST_CONFIG["timeout"])

            lyrics_page.raise_for_status()

            soup = BeautifulSoup(lyrics_page.text, "html.parser")

            # Check for the "This song is an instrumental" message
            placeholder_message = soup.find("div", class_="LyricsPlaceholder__Message-uen8er-2")
            if placeholder_message and "instrumental" in placeholder_message.text.lower():
                return {"synced": False, "lyrics": "This song is an instrumental."}


            lyrics_divs = soup.find_all("div", {"data-lyrics-container": "true"})
            if not lyrics_divs:
                self.logger.error("[Genius] No lyrics div for song %s at %s", song_id, lyrics_url)
                return {"synced": False, "lyrics": "Lyrics not found on Genius page."}

            lyrics = []
            previous_element = None

            for div in lyrics_divs:
                for element in div.contents:
                    if isinstance(element, str):
                        #lyrics.append(element.strip())
                        lyrics.append(LyricsLine(text=element.strip(), start_time=0))
                    elif element.name == "br":
                        # Handle line break
                        if previous_element.name == "br":
                            lyrics.append(LyricsLine(text="", start_time=0))
                        #lyrics.append("\n")
                    elif element.name in ["a", "span", "i", "b"]:
                        # Recursively process nested elements, preserving line breaks and text
                        lyrics.extend(self._process_nested_elements(element))
                    previous_element = element

                # Add a newline for double <br> at the end of each container
                #if div.find_all("br"):
                #    lyrics.append("\n")

            # Join lyrics and normalize double newlines
            #lyrics_text = "".join(lyrics).replace("\n\n", "\n\n").strip()

            #if lyrics_text:
            #    return {"synced": False, "lyrics": lyrics_text}

            result = LyricsData(
                song_id=song_id,
                title=song_info["title"],
                artist=song_info["artist"],
                album=song_info["album"],
                url=lyrics_url,
                lines=lyrics,
                synced=False,
                language=song_info["language"],
                source="Genius",
                media={"thumbnail": song_info["thumbnail_url"]}
            )

            return result
            #return lyrics_text if lyrics_text else "Lyrics not found."

        except requests.Timeout:
            self.logger.error("[Genius] Request timed out while fetching lyrics for song %s", song_id)
            return None
        except requests.RequestException as e:
            self.logger.error("[Genius] Network error while fetching lyrics: %s", str(e))
            return None
        except Exception as e: # pylint: disable=broad-except
            self.logger.error("[Genius] Unexpected error while fetching lyrics: %s", str(e))
            return None


    def _process_nested_elements(self, element):
        try:
            lyrics = []
            for sub_element in element.contents:
                if isinstance(sub_element, str):
                    lyrics.append(LyricsLine(text=sub_element.strip(), start_time=0))
                    #lyrics.append(sub_element.strip())
                elif sub_element.name == "br":
                    # Handle line break
                    #lyrics.append("\n")
                    lyrics.append(LyricsLine(text="", start_time=0))
                elif sub_element.name in ["i", "b", "span", "a"]:
                    # Recursively process nested elements
                    lyrics.extend(self._process_nested_elements(sub_element))
            return lyrics
        except Exception as e: #pylint: disable=broad-except
            self.logger.error("[Genius] Error processing nested elements: %s", str(e))
            return []

    def _refresh_token(self):
        """Refresh the access token using the existing token."""
        refresh_url = "https://api.genius.com/oauth/token"
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }

        response = requests.get(refresh_url,
                                headers=headers,
                                timeout=REQUEST_CONFIG["timeout"])
        if response.status_code == 200:
            self.logger.debug("[Genius] Token refreshed successfully")
            token_data = response.json()
            self.access_token = token_data["access_token"]
            self.headers["Authorization"] = f"Bearer {self.access_token}"
            return True
        return False


    def _make_genius_request(self, url, params=None):
        """Make a request to Genius API with automatic token refresh on 403."""
        response = requests.get(url,
                                headers=self.headers,
                                params=params,
                                timeout=REQUEST_CONFIG["timeout"])

        # Check for Cloudflare or API down states
        if "cloudflare" in response.text.lower():
            self.logger.error("[Genius] Request blocked by Cloudflare protection")
            return {"response": {"hits": []}}
        elif "genius is down" in response.text.lower():
            self.logger.error("[Genius] Genius API appears to be down")
            return {"response": {"hits": []}}


        if response.status_code == 403:
            self.logger.debug("[Genius] Received 403, refreshing access token...")
            if self._refresh_token():
                headers = {"Authorization" : "Bearer " + self.access_token}
                response = requests.get(url,
                                        headers=headers,
                                        params=params,
                                        timeout=REQUEST_CONFIG["timeout"])
        return response.json()


    def _get_genius_token(self):
        self.logger.debug("[Genius] Getting Genius access token...")
        auth_url = "https://api.genius.com/oauth/token"
        data = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }

        headers = {
            "Content-Type": "application/json",
            "User-Agent": REQUEST_CONFIG["user_agent"],
            "Accept": "application/json"
        }

        response = requests.post(auth_url,
                                 headers=headers,
                                 json=data,
                                 timeout=REQUEST_CONFIG["timeout"])

        self.logger.debug("Response status: %s", response.status_code)
        #self.logger.debug(f"Response content: {response.content}")

        if "cloudflare" in response.text.lower():
            self.logger.debug("Cloudflare protection detected - request blocked")
        elif "genius is down" in response.text.lower():
            self.logger.debug("Genius API appears to be down")

        if response.status_code == 200:
            self.logger.debug("[Genius] Got Genius access token.")

            token_data = response.json()
            access_token = token_data["access_token"]

            # Save the new token
            #with open(GENIUS_CONFIG["access_token_file"], 'w', encoding="utf-8") as f:
            #   f.write(access_token)
            self.access_token = access_token
            return access_token
        return None

    def _parse_song_info(self, song_json):
        """
        Extracts song information from Genius API response.

        Args:
            response_json (dict): JSON response from Genius API.

        Returns:
            dict: Extracted song details.
        """
        try:
            song_data = song_json.get("response", {}).get("song", {})

            # Extract required fields
            title = song_data.get("title", "Unknown Title")
            artist_name = song_data.get("primary_artist_names", "Unknown Artist")
            album_data = song_data.get("album", {})
            album_name = album_data.get("name", "Unknown Album")
            language = song_data.get("language", "Unknown Language")
            cover_art_url = song_data.get("song_art_image_url", None)
            thumbnail_url = song_data.get("song_art_image_thumbnail_url", None)

            return {
                "title": title,
                "artist": artist_name,
                "album": album_name,
                "language": language,
                "cover_art_url": cover_art_url,
                "thumbnail_url": thumbnail_url
            }

        except Exception as e:
            print(f"Error parsing song info: {e}")
            return None
