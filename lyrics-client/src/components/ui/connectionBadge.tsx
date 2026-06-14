// src/components/status/ConnectionBadge.tsx

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ConnectionStatus = "connected" | "disconnected" | "success" | "error";

type ConnectionBadgeProps = {
  status: ConnectionStatus;
  label?: string;
  pulse?: boolean;
  className?: string;
};

const STATUS_CONFIG = {
  connected: {
    label: "Connected",
    dotClassName: "bg-green-500",
    badgeClassName: "text-green-600 border-green-600/30",
  },
  success: {
    label: "Pass",
    dotClassName: "bg-green-500",
    badgeClassName: "text-green-600 border-green-600/30",
  },
  disconnected: {
    label: "Disconnected",
    dotClassName: "bg-red-500",
    badgeClassName: "text-red-600 border-red-600/30",
  },
  error: {
    label: "Fail",
    dotClassName: "bg-red-500",
    badgeClassName: "text-red-600 border-red-600/30",
  },
} satisfies Record<
  ConnectionStatus,
  {
    label: string;
    dotClassName: string;
    badgeClassName: string;
  }
>;

export function ConnectionBadge({
  status,
  label,
  pulse = true,
  className,
}: ConnectionBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 font-medium",
        config.badgeClassName,
        className,
      )}
    >
      <span className="relative flex size-2">
        {pulse ? (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              config.dotClassName,
            )}
          />
        ) : null}

        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            config.dotClassName,
          )}
        />
      </span>

      <span>{label ?? config.label}</span>
    </Badge>
  );
}