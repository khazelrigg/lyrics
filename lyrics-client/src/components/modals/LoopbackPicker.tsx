import { useEffect, useState } from "react";

export function LoopbackPicker() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(localStorage.getItem("loopbackDeviceId"));

  async function refresh() {
    // Request permission once to get labels
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {}
    const devs = await navigator.mediaDevices.enumerateDevices();
    setDevices(devs.filter(d => d.kind === "audioinput"));
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-2 py-1"
        value={selected ?? ""}
        onChange={(e) => {
          const id = e.target.value || null;
          setSelected(id);
          if (id) localStorage.setItem("loopbackDeviceId", id);
          else localStorage.removeItem("loopbackDeviceId");
        }}
      >
        <option value="">Select input…</option>
        {devices.map(d => (
          <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
        ))}
      </select>
      <button className="border rounded px-2 py-1" onClick={refresh}>Reload</button>
    </div>
  );
}
