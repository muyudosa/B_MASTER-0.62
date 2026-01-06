
class SoundManager {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createOscillator(freq: number, type: OscillatorType, duration: number, volume: number) {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // 1. 클릭/선택 소리
  playClick() {
    this.createOscillator(600, 'sine', 0.1, 0.1);
  }

  // 2. 굽기 시작 (지글지글 노이즈)
  playSizzle() {
    this.initCtx();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  // 3. 완성 (딩동!)
  playReady() {
    this.createOscillator(880, 'sine', 0.5, 0.2);
    setTimeout(() => this.createOscillator(1174, 'sine', 0.5, 0.15), 100);
  }

  // 4. 타버림 (우우웅...)
  playBurnt() {
    this.createOscillator(150, 'sawtooth', 0.6, 0.2);
    this.createOscillator(130, 'sawtooth', 0.6, 0.2);
  }

  // 5. 수익 발생 (짤랑!)
  playCoin() {
    this.createOscillator(1500, 'sine', 0.2, 0.1);
    setTimeout(() => this.createOscillator(1800, 'sine', 0.3, 0.1), 50);
  }

  // 6. 업그레이드 성공 (팡파르)
  playUpgrade() {
    const notes = [523, 659, 783, 1046];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillator(freq, 'triangle', 0.4, 0.15), i * 100);
    });
  }

  // 7. 경고 (타기 직전)
  playWarning() {
    this.createOscillator(440, 'square', 0.05, 0.05);
  }

  // 8. 손님 등장 (딸랑!)
  playBell() {
    this.createOscillator(1200, 'sine', 0.2, 0.05);
    setTimeout(() => this.createOscillator(1500, 'sine', 0.4, 0.04), 50);
  }
}

export const soundManager = new SoundManager();
