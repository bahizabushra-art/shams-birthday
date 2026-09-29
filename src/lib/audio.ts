class CelestialSoundManager {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public start(): void {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioCtx = new AudioCtx();
      this.isPlaying = true;

      // Pentatonic warm frequencies in Hz (A major / dream scale)
      const scale = [220, 277.18, 329.63, 440, 554.37, 659.25, 880];

      const playRandomChime = () => {
        if (!this.isPlaying || !this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        const freq = scale[Math.floor(Math.random() * scale.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        const now = this.audioCtx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 5.6);

        const nextDelay = 2200 + Math.random() * 3200;
        this.timer = window.setTimeout(playRandomChime, nextDelay);
      };

      playRandomChime();
    } catch (e) {
      console.warn('AudioContext not allowed or supported', e);
      this.isPlaying = false;
    }
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
  }
}

export const celestialSound = new CelestialSoundManager();
