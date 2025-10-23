# lyrics-api

A simple fast api to scrape lyrics from multiple sources

## TODO: 
* Add [lrcLib](https://lrclib.net/) as a new service
* For spotify, need to fetch the track info using the song_id

## Setup

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


## The Code 
`/app/api/routes.py` is where to define endpoints like `/search` `/lyrics` etc.

`/app/services` is where to create new lyrics scraping functions


## Example Queries

`http://localhost:8000/lyrics?song_id=05GnmzpvnAUwnXuOQ5OTop&source=SpotifyLyricsSource`

`http://localhost:8000/search?track=99&artist=faky`