/**
 * Audio Service for frequency generation using Web Audio API
 * Handles pure frequencies and binaural beats generation
 * Client-side only - runs in browser
 */

import { FrequencyOption } from '@/constants/audio';

class AudioService {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;

  /**
   * Initialize or get existing AudioContext
   */
  initAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Load audio file into AudioBuffer
   */
  async loadAudioFile(file: File): Promise<AudioBuffer> {
    const ctx = this.initAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  /**
   * Load audio from URL into AudioBuffer
   */
  async loadAudioFromUrl(url: string): Promise<AudioBuffer> {
    const ctx = this.initAudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  /**
   * Generate pure frequency buffer (sine wave)
   */
  generateFrequencyBuffer(frequency: number, duration: number, sampleRate: number = 44100): AudioBuffer {
    const ctx = this.initAudioContext();
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
      }
    }

    return buffer;
  }

  /**
   * Generate binaural beat buffer
   * Creates different frequencies in left/right channels
   * The brain perceives the difference as a beat (requires headphones)
   */
  generateBinauralBuffer(baseFreq: number, offset: number, duration: number, sampleRate: number = 44100): AudioBuffer {
    const ctx = this.initAudioContext();
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    const leftFreq = baseFreq;
    const rightFreq = baseFreq + offset;

    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);

    for (let i = 0; i < buffer.length; i++) {
      leftData[i] = Math.sin(2 * Math.PI * leftFreq * i / sampleRate);
      rightData[i] = Math.sin(2 * Math.PI * rightFreq * i / sampleRate);
    }

    return buffer;
  }

  /**
   * Generate frequency buffer based on FrequencyOption
   */
  generateFromOption(option: FrequencyOption, duration: number): AudioBuffer | null {
    if (option.type === null || option.value === 'none') {
      return null;
    }

    if (option.type === 'pure' && typeof option.value === 'number') {
      return this.generateFrequencyBuffer(option.value, duration);
    }

    if (option.type === 'binaural' && option.base && option.offset) {
      return this.generateBinauralBuffer(option.base, option.offset, duration);
    }

    return null;
  }

  /**
   * Play audio buffer with volume control
   */
  playAudioBuffer(buffer: AudioBuffer, volume: number = 1.0): void {
    this.stopAudio();
    const ctx = this.initAudioContext();

    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = volume;
    this.gainNode.connect(ctx.destination);

    this.currentSource = ctx.createBufferSource();
    this.currentSource.buffer = buffer;
    this.currentSource.connect(this.gainNode);
    this.currentSource.start(0);
  }

  /**
   * Play frequency with fade in/out
   */
  playWithFade(buffer: AudioBuffer, volume: number, fadeIn: number, fadeOut: number, duration: number): void {
    this.stopAudio();
    const ctx = this.initAudioContext();

    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeIn);
    this.gainNode.gain.setValueAtTime(volume, ctx.currentTime + duration - fadeOut);
    this.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    this.gainNode.connect(ctx.destination);

    this.currentSource = ctx.createBufferSource();
    this.currentSource.buffer = buffer;
    this.currentSource.connect(this.gainNode);
    this.currentSource.start(0);
  }

  /**
   * Stop current audio playback
   */
  stopAudio(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  /**
   * Set volume on current playback
   */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Convert AudioBuffer to WAV Blob
   */
  bufferToWav(buffer: AudioBuffer): Blob {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const data = this.interleave(buffer);
    const dataLength = data.length * bytesPerSample;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    this.floatTo16BitPCM(view, 44, data);

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  /**
   * Mix two audio buffers with volume controls
   */
  mixBuffers(buffer1: AudioBuffer, buffer2: AudioBuffer, volume1: number, volume2: number): AudioBuffer {
    const ctx = this.initAudioContext();
    const length = Math.max(buffer1.length, buffer2.length);
    const sampleRate = buffer1.sampleRate;
    const numberOfChannels = Math.max(buffer1.numberOfChannels, buffer2.numberOfChannels);

    const mixedBuffer = ctx.createBuffer(numberOfChannels, length, sampleRate);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const mixedData = mixedBuffer.getChannelData(channel);
      const data1 = channel < buffer1.numberOfChannels ? buffer1.getChannelData(channel) : buffer1.getChannelData(0);
      const data2 = channel < buffer2.numberOfChannels ? buffer2.getChannelData(channel) : buffer2.getChannelData(0);

      for (let i = 0; i < length; i++) {
        const sample1 = i < data1.length ? data1[i] * volume1 : 0;
        const sample2 = i < data2.length ? data2[i] * volume2 : 0;
        mixedData[i] = Math.max(-1, Math.min(1, sample1 + sample2));
      }
    }

    return mixedBuffer;
  }

  /**
   * Apply fade in/out to buffer
   */
  applyFade(buffer: AudioBuffer, fadeInDuration: number, fadeOutDuration: number): AudioBuffer {
    const ctx = this.initAudioContext();
    const fadedBuffer = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);

    const fadeInSamples = Math.floor(fadeInDuration * buffer.sampleRate);
    const fadeOutSamples = Math.floor(fadeOutDuration * buffer.sampleRate);
    const fadeOutStart = buffer.length - fadeOutSamples;

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = fadedBuffer.getChannelData(channel);

      for (let i = 0; i < buffer.length; i++) {
        let gain = 1;

        if (i < fadeInSamples) {
          gain = i / fadeInSamples;
        } else if (i >= fadeOutStart) {
          gain = (buffer.length - i) / fadeOutSamples;
        }

        outputData[i] = inputData[i] * gain;
      }
    }

    return fadedBuffer;
  }

  private interleave(buffer: AudioBuffer): Float32Array {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels;
    const result = new Float32Array(length);

    let offset = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        result[offset++] = buffer.getChannelData(channel)[i];
      }
    }

    return result;
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private floatTo16BitPCM(view: DataView, offset: number, input: Float32Array): void {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopAudio();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const audioService = new AudioService();
export default AudioService;
