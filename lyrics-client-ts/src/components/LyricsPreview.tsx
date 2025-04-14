interface LyricsLine {
    text: string
}

interface Props {
    prevLine?: LyricsLine
    activeLine?: LyricsLine
    nextLine?: LyricsLine
    onExpand: () => void
}

export default function LyricsPreview({ prevLine, activeLine, nextLine, onExpand }: Props) {
    return (
        <div
            className="sticky top-0 z-10 bg-white/95 backdrop-blur p-4 cursor-pointer"
            onClick={onExpand}
        >
            <ul className="space-y-1 text-center">
                <li className="text-gray-500 text-md">{prevLine?.text || "♪"}</li>
                <li className="text-black font-bold text-lg bg-yellow-200 rounded">
                    {activeLine?.text || "♪"}
                </li>
                <li className="text-gray-500 text-md">{nextLine?.text || "♪"}</li>
            </ul>
        </div>
    )
}