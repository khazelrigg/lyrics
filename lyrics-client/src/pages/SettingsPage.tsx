// src/pages/SettingsPage.tsx

import { OtherSettingsPanel } from "@/components/settings/SettingsPanel";
import { AppHeader } from "@/components/layout/AppHeader";

export default function SettingsPage() {
  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden">
      <AppHeader title="Settings" showBack />
      
      <div className="flex-1 overflow-y-auto">
        <OtherSettingsPanel />
      </div>
    </div>
  );
}
