from dotenv import load_dotenv
import os

# Load from .env
load_dotenv()

GENIUS_CONFIG = {
    "client_id": os.getenv("GENIUS_CLIENT_ID"),
    "client_secret": os.getenv("GENIUS_CLIENT_SECRET"),
    "access_token": os.getenv("GENIUS_ACCESS_TOKEN"),
}

SPOTIFY_CONFIG = {
    "client_id": os.getenv("SPOTIFY_CLIENT_ID"),
    "client_secret": os.getenv("SPOTIFY_CLIENT_SECRET"),
}


# Request settings
REQUEST_CONFIG = {
    "timeout": 10,
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36"
}

# Source settings
SOURCE_CONFIG = {
    "genius_icon": "images/genius_icon.png",
    "uta_net_icon": "images/uta_net_icon.png",
    "spotify_icon": "images/spotify_icon.png",
    "lyricstranslate_icon": "images/lyricstranslate_icon.png",
    "elyrics_icon": "images/elyrics_icon.png",
}