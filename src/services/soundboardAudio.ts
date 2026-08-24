// Web Audio API Synthesizer and Audio Player for APmusic Soundboard

class SoundboardAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playSound(soundType: string, customUrl?: string): void {
    if (customUrl) {
      const audio = new Audio(customUrl);
      audio.volume = 0.9;
      audio.play().catch((err) => console.warn('Custom sound play error:', err));
      return;
    }

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (soundType) {
        case 'bruh': {
          // Low pitched comedic "Bruh" vocal formant synth
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(75, now + 0.6);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(450, now);
          filter.Q.setValueAtTime(4, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.7, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.7);
          break;
        }

        case 'oof': {
          // Classic Roblox/Meme sharp "OOF"
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

          gain.gain.setValueAtTime(0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.26);
          break;
        }

        case 'boom':
        case 'vineboom': {
          // Huge cinematic / Vine Boom sub-bass hit
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

          gain.gain.setValueAtTime(0.9, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.35);
          break;
        }

        case 'clap': {
          // Noise burst snare clap
          const bufferSize = ctx.sampleRate * 0.2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 1000;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(now);
          break;
        }

        case 'laugh': {
          // Staccato laughing chirps
          for (let i = 0; i < 4; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + i * 0.12;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, t);
            osc.frequency.exponentialRampToValueAtTime(380, t + 0.09);

            gain.gain.setValueAtTime(0.6, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
          }
          break;
        }

        case 'wow': {
          // Anime "WOW" pitch sweep up and down
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(620, now + 0.3);
          osc.frequency.exponentialRampToValueAtTime(330, now + 0.8);

          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0.7, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.9);
          break;
        }

        case 'sus': {
          // Dramatic Among Us suspense chord
          const freqs = [330, 392, 440, 523];
          freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0.25 / (idx + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.95);
          });
          break;
        }

        case 'hey': {
          // Upbeat anime/game "Hey!"
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);

          gain.gain.setValueAtTime(0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.26);
          break;
        }

        case 'alert': {
          // Metal Gear solid "!" alert sound
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1760, now + 0.08);

          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.36);
          break;
        }

        case 'applause': {
          // Crowd cheering & clapping texture
          const bufferSize = ctx.sampleRate * 1.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * Math.sin(i / 1000));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1400;
          filter.Q.value = 1.2;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0.6, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(now);
          break;
        }

        case 'drumroll': {
          // Snare roll leading to cymbal crash
          for (let i = 0; i < 18; i++) {
            const t = now + i * 0.06;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220 + i * 5, t);

            gain.gain.setValueAtTime(0.1 + i * 0.03, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.06);
          }
          // Final hit
          const finalOsc = ctx.createOscillator();
          const finalGain = ctx.createGain();
          finalOsc.type = 'sine';
          finalOsc.frequency.setValueAtTime(140, now + 1.1);
          finalGain.gain.setValueAtTime(0.9, now + 1.1);
          finalGain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);
          finalOsc.connect(finalGain);
          finalGain.connect(ctx.destination);
          finalOsc.start(now + 1.1);
          finalOsc.stop(now + 1.65);
          break;
        }

        case 'cash': {
          // Ka-Ching cash register chime
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + idx * 0.07;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.5);
          });
          break;
        }

        case 'airhorn': {
          // Reggae/DJ Airhorn triplet
          const chord = [392, 493.88, 587.33];
          chord.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.setValueAtTime(0.4, now + 0.2);
            gain.gain.setValueAtTime(0, now + 0.22);
            gain.gain.setValueAtTime(0.4, now + 0.26);
            gain.gain.setValueAtTime(0.4, now + 0.46);
            gain.gain.setValueAtTime(0, now + 0.48);
            gain.gain.setValueAtTime(0.45, now + 0.52);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.95);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.0);
          });
          break;
        }

        case 'levelup': {
          // 8-bit Gaming victory arpeggio
          const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + idx * 0.08;
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
          });
          break;
        }

        case 'laser': {
          // Retro sci-fi laser shot
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

          gain.gain.setValueAtTime(0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.26);
          break;
        }

        case 'tada': {
          // Brass fanfare "Ta-Da!"
          const notes1 = [392, 523.25];
          const notes2 = [523.25, 659.25, 783.99];

          notes1.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
          });

          notes2.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + 0.22);
            gain.gain.setValueAtTime(0.35, now + 0.22);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + 0.22);
            osc.stop(now + 0.95);
          });
          break;
        }

        default: {
          // Default harmonic chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.31);
        }
      }
    } catch (err) {
      console.warn('Audio synthesis error:', err);
    }
  }
}

export const soundEngine = new SoundboardAudioEngine();
