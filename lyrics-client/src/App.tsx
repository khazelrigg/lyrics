import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/home"
import CallbackPage from "@/pages/callback"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/callback" element={<CallbackPage />} />
    </Routes>
  )
}