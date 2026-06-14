import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import SearchPage from "@/pages/SearchPage"
import SettingsPage from "@/pages/SettingsPage"
import CallbackPage from "@/pages/CallbackPage"
import LoginPage from "@/pages/LoginPage"

import Layout from "@/layout/Layout"

import { useSpotifySession } from "./hooks/useSpotifySession"
import LibraryPage from "./pages/LibraryPage"

export default function App() {
  // Starts the Spotify session and initialize stores
  useSpotifySession();

  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/search" element={<Layout><SearchPage /></Layout>} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/library" element={<Layout><LibraryPage /></Layout>} />
    </Routes>
  )
}
