interface ProgressBarProps {
    currentTime: number // in ms
    duration: number    // in ms
  }

  export default function ProgressBar({ currentTime, duration }: ProgressBarProps) {
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div className="w-full h-2 bg-gray-700 rounded overflow-hidden mt-2">
        <div
            className="h-full bg-green-500 transition-all duration-300 rounded"
            style={{ width: `${progressPercent}%` }}
        />
        </div>

    )
  }
