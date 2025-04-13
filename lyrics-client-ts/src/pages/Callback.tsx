import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    const getAccessToken = async () => {
      const code = new URLSearchParams(window.location.search).get("code")
      const verifier = localStorage.getItem("code_verifier")

      if (!code || !verifier) {
        console.error("Missing code or verifier")
        return
      }

      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
      const redirectUri = `${window.location.origin}/callback`

      try {
        const params = new URLSearchParams()
        params.append("client_id", clientId)
        params.append("grant_type", "authorization_code")
        params.append("code", code)
        params.append("redirect_uri", redirectUri)
        params.append("code_verifier", verifier)

        const response = await axios.post("https://accounts.spotify.com/api/token", params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })

        const { access_token, expires_in } = response.data
        const expiresAt = Date.now() + expires_in * 1000

        localStorage.setItem("spotify_access_token", access_token)
        localStorage.setItem("spotify_token_expires", expiresAt.toString())

        navigate("/") // redirect to home
      } catch (err) {
        console.error("Failed to exchange token:", err)
      }
    }

    getAccessToken()
  }, [])

  return (
    <div className="text-center mt-10 text-white">
      <p>Authorizing with Spotify...</p>
    </div>
  )
}
