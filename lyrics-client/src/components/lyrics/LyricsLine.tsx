import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LyricsLineProps {
  text: string;
  startTimeMs: number;
  isActive: boolean;
  onClick?: () => void;
}

export default function LyricsLine({
  text,
  isActive,
  onClick,
}: LyricsLineProps) {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "text-center text-md px-2 py-1 cursor-pointer transition-all duration-300",
        isActive ? "text-ui-accent font-bold scale-105" : "text-muted-foreground"
      )}
      layout
    >
      {text}
    </motion.div>
  );
}
