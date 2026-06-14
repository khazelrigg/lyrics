// src/components/settings/SegmentedControl.tsx

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

type SettingSegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange?: (value: T) => void;
};

export function SettingSegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SettingSegmentedControlProps<T>) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (!next) return;
        onChange?.(next as T);
      }}
      className="grid w-full grid-cols-3 gap-2"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cn("h-12 w-full ", option.className)}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}