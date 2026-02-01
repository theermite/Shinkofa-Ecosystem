import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppStore } from '../stores/appStore'

interface AudioSource {
  id: string
  stream: MediaStream
  analyser: AnalyserNode
  dataArray: Uint8Array
}

export function useAudioLevels(): {
  startMicCapture: (deviceId?: string) => Promise<boolean>
  stopMicCapture: () => void
  isMicActive: boolean
  startDesktopCapture: () => Promise<boolean>
  stopDesktopCapture: () => void
  isDesktopActive: boolean
} {
  const updateAudioLevel = useAppStore((state) => state.updateAudioLevel)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourcesRef = useRef<Map<string, AudioSource>>(new Map())
  const animationFrameRef = useRef<number | null>(null)
  const [isMicActive, setIsMicActive] = useState(false)
  const [isDesktopActive, setIsDesktopActive] = useState(false)

  // Calculate audio level from analyser data (0-100)
  // Uses RMS calculation with logarithmic scaling for natural audio perception
  const calculateLevel = useCallback((dataArray: Uint8Array): number => {
    // RMS (Root Mean Square) calculation - better for audio amplitude
    let sumSquares = 0
    for (let i = 0; i < dataArray.length; i++) {
      // Normalize to 0-1 range
      const normalized = dataArray[i] / 255
      sumSquares += normalized * normalized
    }
    const rms = Math.sqrt(sumSquares / dataArray.length)

    // Apply logarithmic scaling for more natural audio perception
    // Human hearing is logarithmic, so this provides better visual feedback
    const db = 20 * Math.log10(rms + 0.0001) // Add small value to avoid log(0)

    // Map dB range to 0-100
    // Typical range: -60dB (silence) to 0dB (max)
    // We use -40dB as floor for better sensitivity
    const minDb = -40
    const maxDb = 0
    const percentage = ((db - minDb) / (maxDb - minDb)) * 100

    // Amplification factor for better visual response
    const amplified = percentage * 1.5

    return Math.min(100, Math.max(0, Math.round(amplified)))
  }, [])

  // Animation loop to update all audio levels
  const updateLevels = useCallback(() => {
    sourcesRef.current.forEach((source) => {
      source.analyser.getByteFrequencyData(source.dataArray as Uint8Array<ArrayBuffer>)
      const level = calculateLevel(source.dataArray)
      updateAudioLevel(source.id, level)
    })
    animationFrameRef.current = requestAnimationFrame(updateLevels)
  }, [calculateLevel, updateAudioLevel])

  // Start the animation loop
  const startLoop = useCallback(() => {
    if (!animationFrameRef.current && sourcesRef.current.size > 0) {
      console.log('[AudioLevels] Starting animation loop')
      updateLevels()
    }
  }, [updateLevels])

  // Stop the animation loop
  const stopLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
      console.log('[AudioLevels] Stopped animation loop')
    }
  }, [])

  // Get or create audio context
  const getAudioContext = useCallback(async (): Promise<AudioContext> => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
      console.log('[AudioLevels] AudioContext resumed')
    }
    return audioContextRef.current
  }, [])

  // Start microphone capture
  const startMicCapture = useCallback(async (deviceId?: string): Promise<boolean> => {
    try {
      const audioContext = await getAudioContext()

      // Request microphone access
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      }

      console.log('[AudioLevels] Requesting microphone access...', constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('[AudioLevels] Microphone stream obtained:', stream.getAudioTracks()[0]?.label)

      // Create analyser with optimized settings for VU meter
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512 // More frequency bins for better accuracy
      analyser.smoothingTimeConstant = 0.3 // Faster response
      analyser.minDecibels = -70 // Capture quieter sounds
      analyser.maxDecibels = -10 // Max level before clipping

      // Connect source to analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Store source info
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      sourcesRef.current.set('mic', { id: 'mic', stream, analyser, dataArray })

      // Start animation loop
      startLoop()
      setIsMicActive(true)

      console.log('[AudioLevels] Microphone capture started successfully')
      return true
    } catch (error) {
      console.error('[AudioLevels] Failed to start microphone capture:', error)
      setIsMicActive(false)
      return false
    }
  }, [getAudioContext, startLoop])

  // Stop microphone capture
  const stopMicCapture = useCallback(() => {
    const source = sourcesRef.current.get('mic')
    if (source) {
      source.stream.getTracks().forEach(track => track.stop())
      sourcesRef.current.delete('mic')
      updateAudioLevel('mic', 0)
      setIsMicActive(false)
      console.log('[AudioLevels] Microphone capture stopped')
    }

    // Stop loop if no more sources
    if (sourcesRef.current.size === 0) {
      stopLoop()
    }
  }, [updateAudioLevel, stopLoop])

  // Start desktop audio capture using Electron's desktopCapturer
  const startDesktopCapture = useCallback(async (): Promise<boolean> => {
    try {
      const audioContext = await getAudioContext()

      // Use Electron's desktopCapturer to get system audio
      // This captures audio from the entire system (loopback)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // @ts-expect-error - Electron-specific constraint for system audio
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        },
        video: {
          // @ts-expect-error - Electron-specific constraint
          mandatory: {
            chromeMediaSource: 'desktop',
            maxWidth: 1,
            maxHeight: 1,
            maxFrameRate: 1
          }
        }
      })

      // Check if audio track exists
      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length === 0) {
        console.warn('[AudioLevels] No audio track in desktop capture')
        stream.getTracks().forEach(track => track.stop())
        return false
      }

      // Stop video track (we only need audio)
      stream.getVideoTracks().forEach(track => track.stop())

      console.log('[AudioLevels] Desktop audio stream obtained:', audioTracks[0]?.label)

      // Create analyser with optimized settings for VU meter
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512 // More frequency bins for better accuracy
      analyser.smoothingTimeConstant = 0.3 // Faster response
      analyser.minDecibels = -70 // Capture quieter sounds
      analyser.maxDecibels = -10 // Max level before clipping

      // Connect source to analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Store source info
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      sourcesRef.current.set('desktop', { id: 'desktop', stream, analyser, dataArray })

      // Start animation loop
      startLoop()
      setIsDesktopActive(true)

      console.log('[AudioLevels] Desktop audio capture started successfully')
      return true
    } catch (error) {
      console.error('[AudioLevels] Failed to start desktop audio capture:', error)
      setIsDesktopActive(false)
      return false
    }
  }, [getAudioContext, startLoop])

  // Stop desktop audio capture
  const stopDesktopCapture = useCallback(() => {
    const source = sourcesRef.current.get('desktop')
    if (source) {
      source.stream.getTracks().forEach(track => track.stop())
      sourcesRef.current.delete('desktop')
      updateAudioLevel('desktop', 0)
      setIsDesktopActive(false)
      console.log('[AudioLevels] Desktop audio capture stopped')
    }

    // Stop loop if no more sources
    if (sourcesRef.current.size === 0) {
      stopLoop()
    }
  }, [updateAudioLevel, stopLoop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[AudioLevels] Cleaning up...')
      sourcesRef.current.forEach((source) => {
        source.stream.getTracks().forEach(track => track.stop())
      })
      sourcesRef.current.clear()
      stopLoop()
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [stopLoop])

  return {
    startMicCapture,
    stopMicCapture,
    isMicActive,
    startDesktopCapture,
    stopDesktopCapture,
    isDesktopActive
  }
}
