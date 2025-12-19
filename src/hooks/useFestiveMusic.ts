import { useCallback, useEffect, useRef, useState } from 'react'

type FestiveMusic = {
  enabled: boolean
  toggle: () => void
  supported: boolean
}

function createAudioContext(): AudioContext | null {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  return Ctx ? new Ctx() : null
}

export default function useFestiveMusic(): FestiveMusic {
  const [enabled, setEnabled] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const timerRef = useRef<number | null>(null)

  const stop = useCallback(async () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (ctxRef.current) {
      try {
        await ctxRef.current.close()
      } catch {
        // ignore
      }
    }

    ctxRef.current = null
    gainRef.current = null
  }, [])

  const start = useCallback(async () => {
    const ctx = createAudioContext()
    if (!ctx) return

    const gain = ctx.createGain()
    gain.gain.value = 0.03
    gain.connect(ctx.destination)

    ctxRef.current = ctx
    gainRef.current = gain

    // Simple “festive-ish” loop (no audio files, works offline).
    const notes: number[] = [
      659.25, // E5
      523.25, // C5
      587.33, // D5
      659.25, // E5
      659.25, // E5
      659.25, // E5
      587.33, // D5
      587.33, // D5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      783.99, // G5
    ]

    let idx = 0

    const playTone = (freq: number, t0: number) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t0)

      const env = ctx.createGain()
      env.gain.setValueAtTime(0.0001, t0)
      env.gain.exponentialRampToValueAtTime(1, t0 + 0.01)
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22)

      osc.connect(env)
      env.connect(gain)

      osc.start(t0)
      osc.stop(t0 + 0.24)
    }

    // Autoplay policies require a user gesture; this only runs after clicking the toggle.
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        // ignore
      }
    }

    timerRef.current = window.setInterval(() => {
      const t0 = ctx.currentTime
      playTone(notes[idx], t0)
      idx = (idx + 1) % notes.length
    }, 260)
  }, [])

  useEffect(() => {
    if (!enabled) {
      stop()
      return
    }

    start()

    return () => {
      stop()
    }
  }, [enabled, start, stop])

  const toggle = useCallback(() => {
    setEnabled((v) => !v)
  }, [])

  const supported =
    typeof window !== 'undefined' &&
    !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)

  return { enabled, toggle, supported }
}
