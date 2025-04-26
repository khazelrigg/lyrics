// src/pages/SettingsPage.tsx
import { Link } from "react-router-dom";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>
      <p className="mb-4">
        Here you can adjust font size, theme, or lyric preferences.
      </p>
      <Link to="/" className="text-blue-400 underline">
        Back to Home
      </Link>
    </div>
  );
}
