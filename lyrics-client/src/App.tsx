import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import SearchPage from "./pages/SearchPage"
import SettingsPage from "./pages/SettingsPage"
import CallbackPage from "./pages/CallbackPage"
import Layout from "./layout/Layout"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/search" element={<Layout><SearchPage /></Layout>} />
      <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
      <Route path="/callback" element={<CallbackPage />} />
    </Routes>
  )
}
