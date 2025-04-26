Start the local search API with python
cd lyrics-api
source venv/bin/activate
uvicorn app.main:app --reload


## Environment Config

Create/Modify the `lyrics-api/.env` file to include

* SPOTIFY_LYRICS_API_URL=http://localhost:8000
* GENIUS_CLIENT_ID=superSecretId
* GENIUS_CLIENT_SECRET=123123321-sdasdfsadfasdf
* GENIUS_ACCESS_TOKEN=aldfjal;
* SPOTIFY_CLIENT_ID=asdfasdfasf
* SPOTIFY_CLIENT_SECRET=asdfasdf
* SPOTIFY_DC=lkjasflkj


## Example Queries

`http://localhost:8000/lyrics?song_id=05GnmzpvnAUwnXuOQ5OTop&source=SpotifyLyricsSource`

`http://localhost:8000/search?track=99&artist=faky`