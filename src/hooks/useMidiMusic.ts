import { useCallback, useEffect, useRef, useState } from 'react'

type Music = {
  enabled: boolean
  toggle: () => void
  supported: boolean
  loop: boolean
  setLoop: (loop: boolean) => void
  melodyId: MelodyId
  setMelodyId: (id: MelodyId) => void
  melodies: ReadonlyArray<{ id: MelodyId; label: string }>
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
  | 'Fs4'
  | 'G4'
  | 'A4'
  | 'B4'
  | 'Bb4'
  | 'C5'
  | 'D5'
  | 'E5'
  | 'Eb5'
  | 'Fs5'
  | 'F5'
  | 'G5'
  | 'A5'

const NOTE_HZ: Record<NoteName, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  Bb4: 466.16,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  Eb5: 622.25,
  Fs5: 739.99,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
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

// “E-lec-tri-fy my heart” / Buttercup meme part
const BUTTERCUP_MEME_PART: Step[] = [
    // Vocal: "E-lec-tri-fy"
  { note: "D5", beats: 0.5 },
  { note: "D5", beats: 0.5 },
  { note: "D5", beats: 0.5 },
  { note: "D5", beats: 0.5 },
  
  // Vocal: "my"
  { note: "E5", beats: 0.5 },
  
  // Vocal: "heart" (Holds for a moment)
  { note: "Fs5", beats: 1 }, 
  
  // Instrumental Synth Run ("Oh-oh-oh" / cascading melody)
  { note: "E5", beats: 1 },
  { note: "D5", beats: 1 },
  { note: "B4", beats: 1 },
  { note: "A4", beats: 1 }, // Held note
  
  // Second part of the run (often included in the loop)
  { note: "D5", beats: 1 },
  { note: "B4", beats: 1 },
  { note: "G4", beats: 1 },
  { note: "Fs4", beats: 2 }, // Ends on the high F# again or resolves to G
];

const DEJA_VU_MEME_PART: Step[] = [
  // "De-ja Vu!"
  { note: 'C5', beats: 0.5 },
  { note: 'D5', beats: 1 },
  { note: 'Eb5', beats: 2 },

  // "I've just been in this place be-fore" (fast run)
  { note: 'Eb5', beats: 0.5 },
  { note: 'Eb5', beats: 0.5 },
  { note: 'D5', beats: 0.5 },
  { note: 'C5', beats: 0.5 },
  { note: 'Bb4', beats: 0.5 },
  { note: 'Bb4', beats: 1 },
  { note: 'C5', beats: 0.5 },
  { note: 'C5', beats: 2 },

  // "High-er on the street"
//   { note: 'C5', beats: 1 },
//   { note: 'D5', beats: 1 },
//   { note: 'Eb5', beats: 2 },

//   // "And I know it's my time to go" (approx fast run)
//   { note: 'C5', beats: 0.5 },
//   { note: 'C5', beats: 0.5 },
//   { note: 'G5', beats: 1 },
//   { note: 'F5', beats: 0.5 },
//   { note: 'Eb5', beats: 0.5 },
//   { note: 'D5', beats: 0.5 },
//   { note: 'Eb5', beats: 0.5 },
//   { note: 'C5', beats: 2 },

  { note: null, beats: 1 },
]

const mochiBaerTheme: Step[] = [
  // Phrase 1: "Mo - chi - Bär" (0:00 - 0:02)
  // Slower, heavy feel
  { note: "A5", beats: 1 },    // "Mo"
  { note: "Fs5", beats: 0.5 }, // "chi"
  { note: "A5", beats: 2 },    // "Bär" (Held)

  // Phrase 2: "ist ein klei-ner Bär" (0:02 - 0:03)
  // Fast run (Eighth notes)
  { note: "A5", beats: 1 },    // "ist"
  { note: "Fs5", beats: 0.5 }, // "ein"
  { note: "E5", beats: 0.5 },  // "klei"
  { note: "Fs5", beats: 0.5 }, // "ner"
  { note: "D5", beats: 2 },    // "Bär"

  // Phrase 3: "Sie - ist - süß" (0:03 - 0:05)
  // Returns to slow tempo
  { note: "A5", beats: 1 },    // "Sie"
  { note: "Fs5", beats: 0.5 }, // "ist"
  { note: "A5", beats: 2 },    // "süß" (Held)

  // Phrase 4: "und ein biss-chen schwer" (0:05 - 0:06)
  // Fast run again
  { note: "A5", beats: 1 },    // "und"
  { note: "Fs5", beats: 0.5 }, // "ein"
  { note: "E5", beats: 0.5 },  // "biss"
  { note: "Fs5", beats: 0.5 }, // "chen"
  { note: "D5", beats: 2.5 },  // "schwer" (End)
  
  { note: null, beats: 1 },
];

type MelodyId = 'jingle-bells' | 'buttercup-meme' | 'deja-vu-meme' | 'mochi-baer-theme'

type Melody = {
  id: MelodyId
  label: string
  steps: Step[]
  tempoBpm: number
}

const MELODIES: Melody[] = [
  { id: 'deja-vu-meme', label: 'Deja Vu', steps: DEJA_VU_MEME_PART, tempoBpm: 155 },
  { id: 'buttercup-meme', label: 'Electrify My Heart', steps: BUTTERCUP_MEME_PART, tempoBpm: 120 },
  { id: 'jingle-bells', label: 'Jingle Bells', steps: JINGLE_BELLS, tempoBpm: 140 },
  { id: 'mochi-baer-theme', label: 'Mochi-Bär Theme', steps: mochiBaerTheme, tempoBpm: 110 },
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

export default function useMidiMusic(): Music {
  const [enabled, setEnabled] = useState(false)
  const [loop, setLoop] = useState(false)
  const [melodyId, setMelodyId] = useState<MelodyId>('deja-vu-meme')
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const timerRef = useRef<number | null>(null)
  const stopTimeoutRef = useRef<number | null>(null)

  const stop = useCallback(async () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (stopTimeoutRef.current != null) {
      window.clearTimeout(stopTimeoutRef.current)
      stopTimeoutRef.current = null
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

    if (stopTimeoutRef.current != null) {
      window.clearTimeout(stopTimeoutRef.current)
      stopTimeoutRef.current = null
    }

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -24
    compressor.knee.value = 24
    compressor.ratio.value = 10
    compressor.attack.value = 0.003
    compressor.release.value = 0.25
    compressor.connect(ctx.destination)

    const gain = ctx.createGain()
    // User-requested target volume. Compressor provides headroom against clipping.
    gain.gain.value = 0.9
    gain.connect(compressor)

    ctxRef.current = ctx
    gainRef.current = gain

    const melody = MELODIES.find((m) => m.id === melodyId) ?? MELODIES[0]

    // Melody with a meow-like synth voice (no audio files, works offline).
    const tempoBpm = melody.tempoBpm
    const beatSec = 60 / tempoBpm
    const lookAheadSec = 0.25
    const tickMs = 80

    let stepIndex = 0
    let nextTime = ctx.currentTime + 0.05
    let stopQueued = false

    const queueStop = (stopAtTime: number) => {
      if (stopQueued) return
      stopQueued = true

      if (timerRef.current != null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }

      const msUntilStop = Math.max(0, Math.ceil((stopAtTime - ctx.currentTime) * 1000))
      stopTimeoutRef.current = window.setTimeout(() => {
        // Fade quickly to avoid an abrupt cut.
        try {
          const now = ctx.currentTime
          gain.gain.cancelScheduledValues(now)
          gain.gain.setTargetAtTime(0.0001, now, 0.02)
        } catch {
          // ignore
        }

        void stop()
      }, msUntilStop)
    }

    const schedule = () => {
      while (!stopQueued && nextTime < ctx.currentTime + lookAheadSec) {
        if (stepIndex >= melody.steps.length) {
          // Non-looping mode: we're done.
          queueStop(nextTime + 0.08)
          return
        }

        const step = melody.steps[stepIndex]
        const stepSec = step.beats * beatSec

        if (step.note) {
          // Keep notes a bit shorter than their slot, to avoid smear.
          const noteSec = Math.max(0.09, stepSec * 0.85)
          playMeowNote(ctx, gain, NOTE_HZ[step.note], nextTime, noteSec)
        }

        nextTime += stepSec

        stepIndex += 1
        if (loop) {
          stepIndex = stepIndex % melody.steps.length
        } else if (stepIndex >= melody.steps.length) {
          // Let the last scheduled note/rhythm ring a tiny bit.
          queueStop(nextTime + 0.08)
        }
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
  }, [loop, melodyId, stop])

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

  return {
    enabled,
    toggle,
    supported,
    loop,
    setLoop,
    melodyId,
    setMelodyId,
    melodies: MELODIES.map(({ id, label }) => ({ id, label })),
  }
}
