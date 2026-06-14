// src/components/settings/OtherSettingsPanel.tsx

import {
  AlignVerticalJustifyCenter,
  ChevronRight,
  Languages,
  Palette,
  Type,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  SettingSegmentedControl,
  type SegmentedOption,
} from "@/components/settings/SegmentedControl";
import { SettingToggleRow } from "@/components/settings/SettingsToggleRow";

type FontFamily = "sora" | "inter" | "roboto";
type FontSize = "small" | "medium" | "large";

type OtherSettingsPanelProps = {
  lightMode?: boolean;
  autoScroll?: boolean;
  showTranslations?: boolean;
  fontFamily?: FontFamily;
  fontSize?: FontSize;
  spotifyConnected?: boolean;

  onLightModeChange?: (checked: boolean) => void;
  onAutoScrollChange?: (checked: boolean) => void;
  onShowTranslationsChange?: (checked: boolean) => void;
  onFontFamilyChange?: (value: FontFamily) => void;
  onFontSizeChange?: (value: FontSize) => void;
  onSpotifyClick?: () => void;
  onAnkiClick?: () => void;
  onLyricsProvidersClick?: () => void;
  onLogout?: () => void;
};

const FONT_FAMILY_OPTIONS: SegmentedOption<FontFamily>[] = [
  { value: "sora", label: <FontPreview name="Sans" sample="あAa" />, className: "font-sans font-[Noto_Sans] h-16" },
  { value: "inter", label: <FontPreview name="Serif" sample="あAa" />, className: "font-serif font-[Noto_Serif] h-16" },
  { value: "roboto", label: <FontPreview name="Meiryo" sample="あAa" />, className: "font-[Meiryo] h-16" },
];

const FONT_SIZE_OPTIONS: SegmentedOption<FontSize>[] = [
  { value: "small", label: "Small", className: "text-sm" },
  { value: "medium", label: "Medium", className: "text-base" },
  { value: "large", label: "Large", className: "text-lg" },
];

export function OtherSettingsPanel({
  lightMode = false,
  autoScroll = true,
  showTranslations = false,
  fontFamily = "sora",
  fontSize = "medium",
  spotifyConnected = true,
  onLightModeChange,
  onAutoScrollChange,
  onShowTranslationsChange,
  onFontFamilyChange,
  onFontSizeChange,
  onSpotifyClick,
  onAnkiClick,
  onLyricsProvidersClick,
}: OtherSettingsPanelProps) {
  return (
    <TooltipProvider>
      <div className="mx-auto max-w-2xl space-y-8 px-5 pb-32">
        <SettingsSection title="Appearance">
          <SettingsGroup>
            <SettingToggleRow
              icon={<Palette className="size-5" />}
              title="Light Mode"
              description="Use a brighter app theme."
              checked={lightMode}
              onCheckedChange={onLightModeChange}
            />
          </SettingsGroup>
        </SettingsSection>

        <SettingsSection title="Typography">
          <SettingsGroup>
            <SettingSegmentedRow
              icon={<Type className="size-5" />}
              title="Font Family"
              description="Choose the lyric display font."
              value={fontFamily}
              options={FONT_FAMILY_OPTIONS}
              onChange={onFontFamilyChange}
            />

            <SettingSegmentedRow
              icon={<Type className="size-5" />}
              title="Font Size"
              description="Adjust lyric readability."
              value={fontSize}
              options={FONT_SIZE_OPTIONS}
              onChange={onFontSizeChange}
            />
          </SettingsGroup>
        </SettingsSection>

        <SettingsSection title="Lyrics Display">
          <SettingsGroup>
            <SettingToggleRow
              icon={<AlignVerticalJustifyCenter className="size-5" />}
              title="Auto-Scroll Lyrics"
              description="Keep the active lyric centered while music plays."
              checked={autoScroll}
              onCheckedChange={onAutoScrollChange}
            />

            <SettingToggleRow
              icon={<Languages className="size-5" />}
              title="Show Translations"
              description="Display translated lyric lines when available."
              checked={showTranslations}
              onCheckedChange={onShowTranslationsChange}
              badge="Soon"
              disabled
              tooltip="Translation support is not implemented yet."
            />
          </SettingsGroup>
        </SettingsSection>

        <SettingsSection title="Integrations">
          <SettingsGroup>
            <SettingNavigationRow
              icon={<SpotifyIcon />}
              title="Spotify Connection"
              description="Manage your Spotify account connection."
              badge={spotifyConnected ? "Connected" : "Not Connected"}
              badgeVariant={spotifyConnected ? "default" : "secondary"}
              onClick={onSpotifyClick}
            />

            <SettingNavigationRow
              icon={
                <span className="material-symbols-outlined text-blue-400">
                  layers
                </span>
              }
              title="Anki Integration"
              description="Create cards from lyrics and vocabulary."
              badge="Soon"
              tooltip="AnkiConnect support is planned, but not wired up yet."
              onClick={onAnkiClick}
            />

            <SettingNavigationRow
              icon={
                <span className="material-symbols-outlined text-primary">
                  lyrics
                </span>
              }
              title="Lyrics Providers"
              description="Manage preferred lyric sources."
              badge="Manage"
              tooltip="Provider settings can stay visible before the backend is finished."
              onClick={onLyricsProvidersClick}
            />
          </SettingsGroup>
        </SettingsSection>


      </div>
    </TooltipProvider>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return (
    <ItemGroup className="overflow-hidden rounded-xl border text-primary backdrop-blur-xl">
      {children}
    </ItemGroup>
  );
}

function SettingSegmentedRow<T extends string>({
  icon,
  title,
  description,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange?: (value: T) => void;
}) {
  return (
    <Item className="items-start">
      <ItemMedia>
        <span className="text-muted-foreground">{icon}</span>
      </ItemMedia>

      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {description ? <ItemDescription>{description}</ItemDescription> : null}

        <div className="mt-4">
          <SettingSegmentedControl
            value={value}
            options={options}
            onChange={(next) => onChange?.(next)}
          />
        </div>
      </ItemContent>
    </Item>
  );
}

function SettingNavigationRow({
  icon,
  title,
  description,
  badge,
  badgeVariant = "secondary",
  tooltip,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: React.ComponentProps<typeof Badge>["variant"];
  tooltip?: string;
  onClick?: () => void;
}) {
  const row = (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left transition hover:bg-muted/50 active:scale-[0.98]"
    >
      <Item>
        <ItemMedia>
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle className="flex items-center gap-2">
            {title}
            {badge ? <Badge variant={badgeVariant}>{badge}</Badge> : null}
          </ItemTitle>

          {description ? <ItemDescription>{description}</ItemDescription> : null}
        </ItemContent>

        <ItemActions>
          <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-1" />
        </ItemActions>
      </Item>
    </button>
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

function SpotifyIcon() {
  return (
    <svg className="size-6 fill-[#1db954]" viewBox="0 0 24 24">
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.505 17.31c-.217.356-.677.472-1.033.255-2.86-1.748-6.46-2.144-10.697-1.177-.406.093-.815-.163-.908-.57-.093-.406.163-.815.57-.908 4.634-1.06 8.604-.613 11.794 1.334.356.217.472.677.255 1.033zm1.47-3.254c-.273.443-.852.585-1.295.312-3.273-2.012-8.26-2.593-12.13-1.417-.5.152-1.032-.132-1.184-.632-.152-.5.132-1.032.632-1.184 4.417-1.34 9.907-.69 13.666 1.62.443.272.585.85.312 1.293v.008zm.126-3.388c-3.924-2.33-10.392-2.546-14.167-1.4c-.604.183-1.248-.166-1.432-.77-.183-.604.166-1.248.77-1.432 4.332-1.316 11.476-1.06 16.002 1.624.542.322.72 1.022.398 1.564-.322.543-1.022.72-1.564.398l-.007.016z" />
    </svg>
  );
}

function FontPreview({
  name,
  sample,
}: {
  name: string;
  sample: string;
}) {
  return (
    <span className="flex flex-col items-center leading-tight">
      <span className="text-base font-semibold">{name}</span>
      <span className="text-sm opacity-60">{sample}</span>
    </span>
  );
}