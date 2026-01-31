'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { FREQUENCY_OPTIONS, MUSIC_LIBRARY } from '@/constants/audio';

/**
 * Hook for previewing audio tracks (music + frequency) in sync with video playback
 * Uses Web Audio API for real-time audio mixing
 */
export function useAudioPreview() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Music nodes
  const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicBufferRef = useRef<AudioBuffer | null>(null);
  const musicLoadedIdRef = useRef<string | null>(null);

  // Frequency nodes (using oscillator for efficiency)
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const frequencyGainRef = useRef<GainNode | null>(null);
  const frequencyMergerRef = useRef<ChannelMergerNode | null>(null);

  // State tracking
  const isPlayingRef = useRef(false);
  const startTimeRef = useRef(0);

  const { audioTracks, isPlaying, currentTime, duration, volume, isMuted } = useEditorStore();

  const musicTrack = audioTracks.find((t) => t.type === 'music' && t.isActive);
  const freqTrack = audioTracks.find((t) => t.type === 'frequency' && t.isActive);

  // Initialize AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Load music buffer
  const loadMusicBuffer = useCallback(async (url: string, trackId: string) => {
    if (musicLoadedIdRef.current === trackId && musicBufferRef.current) {
      return musicBufferRef.current;
    }

    try {
      const ctx = getAudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      musicBufferRef.current = audioBuffer;
      musicLoadedIdRef.current = trackId;

      console.log('[AudioPreview] Music loaded:', trackId);
      return audioBuffer;
    } catch (error) {
      console.error('[AudioPreview] Failed to load music:', error);
      return null;
    }
  }, [getAudioContext]);

  // Stop music playback
  const stopMusic = useCallback(() => {
    if (musicSourceRef.current) {
      try {
        musicSourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      musicSourceRef.current.disconnect();
      musicSourceRef.current = null;
    }
  }, []);

  // Start music playback from specific time
  const startMusic = useCallback((buffer: AudioBuffer, offset: number, musicVolume: number) => {
    stopMusic();

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create gain node
    musicGainRef.current = ctx.createGain();
    musicGainRef.current.gain.value = musicVolume;
    musicGainRef.current.connect(ctx.destination);

    // Create source
    musicSourceRef.current = ctx.createBufferSource();
    musicSourceRef.current.buffer = buffer;
    musicSourceRef.current.loop = true; // Loop music if video is longer
    musicSourceRef.current.connect(musicGainRef.current);

    // Start from offset (modulo buffer duration for looping)
    const offsetInBuffer = offset % buffer.duration;
    musicSourceRef.current.start(0, offsetInBuffer);

    console.log('[AudioPreview] Music started at offset:', offsetInBuffer.toFixed(2));
  }, [getAudioContext, stopMusic]);

  // Stop frequency oscillators
  const stopFrequency = useCallback(() => {
    if (oscillatorLeftRef.current) {
      try {
        oscillatorLeftRef.current.stop();
      } catch (e) {}
      oscillatorLeftRef.current.disconnect();
      oscillatorLeftRef.current = null;
    }
    if (oscillatorRightRef.current) {
      try {
        oscillatorRightRef.current.stop();
      } catch (e) {}
      oscillatorRightRef.current.disconnect();
      oscillatorRightRef.current = null;
    }
    if (frequencyGainRef.current) {
      frequencyGainRef.current.disconnect();
      frequencyGainRef.current = null;
    }
    if (frequencyMergerRef.current) {
      frequencyMergerRef.current.disconnect();
      frequencyMergerRef.current = null;
    }
  }, []);

  // Start frequency oscillators
  const startFrequency = useCallback((sourceId: string, freqVolume: number) => {
    stopFrequency();

    const freqOption = FREQUENCY_OPTIONS.find((f) => String(f.value) === sourceId);
    if (!freqOption || freqOption.type === null) return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create gain node
    frequencyGainRef.current = ctx.createGain();
    frequencyGainRef.current.gain.value = freqVolume;
    frequencyGainRef.current.connect(ctx.destination);

    if (freqOption.type === 'pure' && typeof freqOption.value === 'number') {
      // Pure frequency - same tone in both channels
      oscillatorLeftRef.current = ctx.createOscillator();
      oscillatorLeftRef.current.type = 'sine';
      oscillatorLeftRef.current.frequency.value = freqOption.value;
      oscillatorLeftRef.current.connect(frequencyGainRef.current);
      oscillatorLeftRef.current.start();

      console.log('[AudioPreview] Pure frequency started:', freqOption.value, 'Hz');
    } else if (freqOption.type === 'binaural' && freqOption.base && freqOption.offset) {
      // Binaural beat - different frequencies in left/right channels
      frequencyMergerRef.current = ctx.createChannelMerger(2);
      frequencyMergerRef.current.connect(frequencyGainRef.current);

      // Left channel
      oscillatorLeftRef.current = ctx.createOscillator();
      oscillatorLeftRef.current.type = 'sine';
      oscillatorLeftRef.current.frequency.value = freqOption.base;
      oscillatorLeftRef.current.connect(frequencyMergerRef.current, 0, 0);
      oscillatorLeftRef.current.start();

      // Right channel
      oscillatorRightRef.current = ctx.createOscillator();
      oscillatorRightRef.current.type = 'sine';
      oscillatorRightRef.current.frequency.value = freqOption.base + freqOption.offset;
      oscillatorRightRef.current.connect(frequencyMergerRef.current, 0, 1);
      oscillatorRightRef.current.start();

      console.log('[AudioPreview] Binaural beat started:', freqOption.base, 'Hz /', freqOption.base + freqOption.offset, 'Hz');
    }
  }, [getAudioContext, stopFrequency]);

  // Update music volume
  useEffect(() => {
    if (musicGainRef.current && musicTrack) {
      musicGainRef.current.gain.value = isMuted ? 0 : musicTrack.volume;
    }
  }, [musicTrack?.volume, isMuted]);

  // Update frequency volume
  useEffect(() => {
    if (frequencyGainRef.current && freqTrack) {
      frequencyGainRef.current.gain.value = isMuted ? 0 : freqTrack.volume;
    }
  }, [freqTrack?.volume, isMuted]);

  // Handle play/pause
  useEffect(() => {
    const handlePlayback = async () => {
      if (isPlaying && !isPlayingRef.current) {
        // Starting playback
        isPlayingRef.current = true;
        startTimeRef.current = currentTime;

        // Start music if configured
        if (musicTrack && musicTrack.url) {
          const musicInfo = MUSIC_LIBRARY.find((m) => m.id === musicTrack.sourceId);
          if (musicInfo && musicInfo.url) {
            const buffer = await loadMusicBuffer(musicInfo.url, musicTrack.sourceId);
            if (buffer) {
              startMusic(buffer, currentTime, isMuted ? 0 : musicTrack.volume);
            }
          }
        }

        // Start frequency if configured
        if (freqTrack) {
          startFrequency(freqTrack.sourceId, isMuted ? 0 : freqTrack.volume);
        }

      } else if (!isPlaying && isPlayingRef.current) {
        // Stopping playback
        isPlayingRef.current = false;
        stopMusic();
        stopFrequency();
      }
    };

    handlePlayback();
  }, [isPlaying, currentTime, musicTrack, freqTrack, isMuted, loadMusicBuffer, startMusic, startFrequency, stopMusic, stopFrequency]);

  // Handle seek (when paused and user seeks)
  useEffect(() => {
    if (!isPlaying) {
      // When paused, we don't need to do anything special
      // Audio will restart from new position when play is pressed
      startTimeRef.current = currentTime;
    }
  }, [currentTime, isPlaying]);

  // Handle track changes
  useEffect(() => {
    // If playing and track changed, restart audio
    if (isPlaying) {
      stopMusic();
      stopFrequency();

      const restartAudio = async () => {
        if (musicTrack && musicTrack.url) {
          const musicInfo = MUSIC_LIBRARY.find((m) => m.id === musicTrack.sourceId);
          if (musicInfo && musicInfo.url) {
            const buffer = await loadMusicBuffer(musicInfo.url, musicTrack.sourceId);
            if (buffer) {
              startMusic(buffer, currentTime, isMuted ? 0 : musicTrack.volume);
            }
          }
        }

        if (freqTrack) {
          startFrequency(freqTrack.sourceId, isMuted ? 0 : freqTrack.volume);
        }
      };

      restartAudio();
    }
  }, [musicTrack?.sourceId, freqTrack?.sourceId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
      stopFrequency();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stopMusic, stopFrequency]);

  // Resume AudioContext on user interaction (required by browsers)
  const resumeAudioContext = useCallback(() => {
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }, []);

  return {
    resumeAudioContext,
    hasMusicTrack: !!musicTrack,
    hasFrequencyTrack: !!freqTrack,
  };
}
