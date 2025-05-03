import { useSettingsStore } from "@/stores/settingsStore"

export function useFontSettings() {
  const { fontSettings } = useSettingsStore()

  const fontFamilyClass = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
    rounded: "font-rounded", // Using font-sans as a fallback for rounded
  }[fontSettings.fontFamily]

  const textAlignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[fontSettings.textAlignment]

  const fontSizeStyle = {
    fontSize: `${fontSettings.fontSize}px`,
  }

  return {
    className: `${fontFamilyClass} ${textAlignmentClass}`,
    style: fontSizeStyle,
    fontSettings,
  }
}
