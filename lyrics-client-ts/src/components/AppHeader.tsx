export default function AppHeader() {
    return (
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          {/* Logo or Title */}
          <div className="text-xl font-semibold text-gray-800">
            LyricsSync
          </div>

          {/* Menu Button */}
          <button className="text-gray-200 bg-gray-600 hover:text-gray-800 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
    )
  }
