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

type NoteName =
  | 'C4'
  | 'D4'
  | 'E4'
  | 'F4'
  | 'G4'
  | 'A4'
  | 'B4'
  | 'C5'
  | 'D5'
  | 'E5'

const NOTE_HZ: Record<NoteName, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
}

type Step = { note: NoteName | null; beats: number }

// Jingle Bells (opening phrase), in C major.
// We loop this longer phrase to feel more like the song.
const JINGLE_BELLS: Step[] = [
  { note: 'E4', beats: 1 },
  { note: 'E4', beats: 1 },
  { note: 'E4', beats: 2 },
  { note: 'E4', beats: 1 },
  { note: 'E4', beats: 1 },
  { note: 'E4', beats: 2 },
  { note: 'E4', beats: 1 },
  { note: 'G4', beats: 1 },
  { note: 'C4', beats: 1.5 },
  { note: 'D4', beats: 0.5 },
  { note: 'E4', beats: 3 },
  { note: null, beats: 1 },

  { note: 'F4', beats: 1 },
  { note: 'F4', beats: 1 },
  { note: 'F4', beats: 1.5 },
  { note: 'F4', beats: 0.5 },
  { note: 'F4', beats: 1 },
  { note: 'E4', beats: 1 },
  { note: 'E4', beats: 1 },
  { note: 'E4', beats: 0.5 },
  { note: 'E4', beats: 0.5 },
  { note: 'E4', beats: 1 },
  { note: 'D4', beats: 1 },
  { note: 'D4', beats: 1 },
  { note: 'E4', beats: 1 },
  { note: 'D4', beats: 2 },
  { note: 'G4', beats: 2 },
  { note: null, beats: 1 },
]

function playMeowNote(ctx: AudioContext, out: AudioNode, freqHz: number, t0: number, durationSec: number) {
  // A small “meow-ish” synth:
  // - sawtooth oscillator
  // - gentle downward pitch glide
  // - bandpass filter for a vocal-ish formant
  // - short envelope
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'

  const startHz = Math.max(60, freqHz * 1.25)
  const endHz = Math.max(50, freqHz * 0.92)
  osc.frequency.setValueAtTime(startHz, t0)
  osc.frequency.exponentialRampToValueAtTime(endHz, t0 + Math.max(0.05, durationSec * 0.7))

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(Math.min(1200, 600 + freqHz), t0)
  filter.Q.setValueAtTime(6, t0)

  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, t0)
  env.gain.exponentialRampToValueAtTime(1, t0 + 0.015)
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.08, durationSec))

  // Tiny breath/noise for consonant-like attack.
  const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuf

  const noiseEnv = ctx.createGain()
  noiseEnv.gain.setValueAtTime(0.0001, t0)
  noiseEnv.gain.exponentialRampToValueAtTime(1, t0 + 0.003)
  noiseEnv.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.02)

  osc.connect(filter)
  filter.connect(env)
  env.connect(out)

  noise.connect(noiseEnv)
  noiseEnv.connect(out)

  osc.start(t0)
  osc.stop(t0 + durationSec + 0.05)
  noise.start(t0)
  noise.stop(t0 + 0.03)
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

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -24
    compressor.knee.value = 24
    compressor.ratio.value = 10
    compressor.attack.value = 0.003
    compressor.release.value = 0.25
    compressor.connect(ctx.destination)

    const gain = ctx.createGain()
    gain.gain.value = 0.08
    gain.connect(compressor)

    ctxRef.current = ctx
    gainRef.current = gain

    // Jingle Bells melody with a meow-like synth voice (no audio files, works offline).
    const tempoBpm = 120
    const beatSec = 60 / tempoBpm
    const lookAheadSec = 0.25
    const tickMs = 80

    let stepIndex = 0
    let nextTime = ctx.currentTime + 0.05

    const schedule = () => {
      while (nextTime < ctx.currentTime + lookAheadSec) {
        const step = JINGLE_BELLS[stepIndex]
        const stepSec = step.beats * beatSec

        if (step.note) {
          // Keep notes a bit shorter than their slot, to avoid smear.
          const noteSec = Math.max(0.09, stepSec * 0.85)
          playMeowNote(ctx, gain, NOTE_HZ[step.note], nextTime, noteSec)
        }

        nextTime += stepSec
        stepIndex = (stepIndex + 1) % JINGLE_BELLS.length
      }
    }

    // Autoplay policies require a user gesture; this only runs after clicking the toggle.
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        // ignore
      }
    }

    timerRef.current = window.setInterval(schedule, tickMs)
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
