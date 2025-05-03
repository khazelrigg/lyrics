import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFontSettings } from "@/hooks/useFontSettings"; // <- update path if needed

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
  const { className: fontClass, style } = useFontSettings();

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        fontClass,
        "text-md px-2 py-1 cursor-pointer transition-all duration-300",
        isActive
          ? "text-ui-accent"
          : "text-muted-foreground"
      )}
      style={style}
      layout
    >
      {text}
    </motion.div>
  );
}
