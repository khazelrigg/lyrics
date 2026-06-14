    <div className="min-h-screen max-h-screen bg-neutral-950 text-white grid grid-rows-[auto_1fr_auto]">
      {/* Header */}
      <header className="border-b border-red-400 p-4 bg-neutral-900 z-20">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold">
            <Link to="/">🎵 Lyrics App</Link>
          </h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/search" className="text-blue-400 hover:underline">
              Search
            </Link>
            <Link to="/settings" className="text-white hover:underline">
              Settings
            </Link>
          </nav>
          <ConnectSpotify />
        </div>
      </header>