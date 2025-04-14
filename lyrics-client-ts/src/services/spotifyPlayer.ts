import axios from "axios"

const SPOTIFY_API = "https://api.spotify.com/v1"

function getAccessToken() {
    return localStorage.getItem("spotify_access_token")
}

function getHeaders() {
    const token = getAccessToken()
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    }
}


export async function getActiveDeviceId(): Promise<string | null> {
    const token = getAccessToken()
    const response = await axios.get(`${SPOTIFY_API}/me/player/devices`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const devices = response.data.devices
    const active = devices.find((d: any) => d.is_active)

    return active?.id ?? null
}


export async function play() {
    const deviceId = await getActiveDeviceId()
    if (!deviceId) {
        console.warn("No active Spotify device found.")
        return
    }

    await axios.put(
        `${SPOTIFY_API}/me/player/play?device_id=${deviceId}`,
        {},
        { headers: getHeaders() }
    )
}

export async function pause() {
    const deviceId = await getActiveDeviceId()
    if (!deviceId) {
        console.warn("No active Spotify device found.")
        return
    }

    await axios.put(
        `${SPOTIFY_API}/me/player/pause?device_id=${deviceId}`,
        {},
        { headers: getHeaders() }
    )
}

export async function nextTrack() {
    const deviceId = await getActiveDeviceId()
    if (!deviceId) {
        console.warn("No active Spotify device found.")
        return
    }

    await axios.post(
        `${SPOTIFY_API}/me/player/next?device_id=${deviceId}`,
        {},
        { headers: getHeaders() }
    )
}


export async function previousTrack() {
    const deviceId = await getActiveDeviceId()
    if (!deviceId) {
        console.warn("No active Spotify device found.")
        return
    }

    await axios.post(
        `${SPOTIFY_API}/me/player/previous?device_id=${deviceId}`,
        {},
        { headers: getHeaders() }
    )
}

export async function seek(positionMs: number) {
    console.log("Request to seek to ", positionMs)
    const deviceId = await getActiveDeviceId()
    if (!deviceId) {
        console.warn("No active Spotify device found.")
        return
    }

    await axios.put(
        `${SPOTIFY_API}/me/player/seek?position_ms=${positionMs}`,
        {},
        { headers: getHeaders() }
    )
}

