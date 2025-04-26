// src/components/Spotify/ConnectSpotify.tsx
import {
  initiateSpotifyAuth,
  getAccessToken,
  clearAccessToken,
} from "../../services/spotifyAuth";
import { useEffect, useRef, useState } from "react";
import { getUserProfile } from "../../services/spotifyApi";

/**
 * A small header component that either shows the login button or the user avatar if logged in.
 */
export default function ConnectSpotify() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    setIsLoggedIn(true);

    getUserProfile()
      .then((data) => {
        setProfileImg(data.images?.[0]?.url || null);
        setDisplayName(data.display_name || null);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAccessToken();
    window.location.reload();
  };

  if (!isLoggedIn) {
    return (
      <button
        onClick={initiateSpotifyAuth}
        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
      >
        Connect Spotify
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2"
      >
        {profileImg ? (
          <img
            src={profileImg}
            alt="Spotify profile"
            className="w-8 h-8 rounded-full shadow"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold text-black">
            {displayName?.charAt(0) || "S"}
          </div>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-40 bg-neutral-800 border border-neutral-700 rounded shadow-lg p-2 z-50">
          <p className="text-sm text-white px-2 pb-2 truncate">{displayName}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-2 py-1 text-sm text-red-400 hover:text-white hover:bg-red-500 rounded"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
