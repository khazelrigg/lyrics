// src/components/settings/SettingToggleRow.tsx

import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SettingToggleRowProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  badge?: string;
  disabled?: boolean;
  tooltip?: string;
};

export function SettingToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  badge,
  disabled = false,
  tooltip,
}: SettingToggleRowProps) {
  const row = (
    <Item
      className={[
        "items-start",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <ItemMedia>
        <span className="text-muted-foreground">{icon}</span>
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="flex items-center gap-2">
          {title}
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </ItemTitle>

        {description ? (
          <ItemDescription>{description}</ItemDescription>
        ) : null}
      </ItemContent>

      <ItemActions>
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          aria-label={title}
        />
      </ItemActions>
    </Item>
  );

  if (!tooltip) return row;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}