export type RecorderOpts = {
  deviceId?: string;           // persistent loopback/mic device id
  bitrate?: number;            // bits per second
};

export class LoopbackRecorder {
  private stream: MediaStream | null = null;
  private ac: AudioContext | null = null;
  private dest: MediaStreamAudioDestinationNode | null = null;
  private mr: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private mime: string = "audio/webm;codecs=opus";
  private bitrate: number;

  constructor(opts: RecorderOpts = {}) {
    this.bitrate = opts.bitrate ?? 128000;
  }

  async ensureStream(deviceId?: string) {
    if (this.stream) return;
    // Ask for the input (loopback/mic). Recommend disabling echo/noise/AGC for music.
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 2,
      },
    });
  }

  async start(deviceId?: string) {
    await this.ensureStream(deviceId);
    if (!this.stream) throw new Error("No audio stream");

    this.ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = this.ac.createMediaStreamSource(this.stream);
    this.dest = this.ac.createMediaStreamDestination();
    source.connect(this.dest);

    // Pick a supported mime
    if (!MediaRecorder.isTypeSupported(this.mime)) {
      this.mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
    }
    this.chunks = [];
    this.mr = new MediaRecorder(this.dest.stream, {
      mimeType: this.mime || undefined,
      audioBitsPerSecond: this.bitrate,
    });
    this.mr.ondataavailable = (e) => e.data && this.chunks.push(e.data);
    this.mr.start();
  }

  async stop(): Promise<Blob> {
    if (!this.mr) throw new Error("Recorder not started");
    const mr = this.mr;
    this.mr = null;

    const blobP = new Promise<Blob>((resolve) => {
      mr.onstop = () => {
        const out = new Blob(this.chunks, { type: this.mime || "audio/webm" });
        // cleanup graph (keep stream for reuse)
        this.dest?.disconnect(); this.dest = null;
        this.ac?.close(); this.ac = null;
        resolve(out);
      };
    });
    mr.stop();
    return blobP;
  }

  // Optional: call when app exits
  dispose() {
    if (this.mr && this.mr.state === "recording") this.mr.stop();
    this.dest?.disconnect(); this.dest = null;
    this.ac?.close(); this.ac = null;
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }
}
