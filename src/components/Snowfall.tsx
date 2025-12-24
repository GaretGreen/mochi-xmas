import { useMemo } from 'react'

type Snowflake = {
  id: number
  size: number
  left: number
  fallDuration: number
  fallDelay: number
  swayDuration: number
  opacity: number
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function Snowfall({ count = 70 }: { count?: number }) {
  const flakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const rnd = mulberry32(i + 1)
      const size = 3 + rnd() * 6
      const left = rnd() * 100
      const fallDuration = 7 + rnd() * 10
      const fallDelay = -rnd() * fallDuration
      const swayDuration = 3 + rnd() * 4
      const opacity = 0.55 + rnd() * 0.4

      return {
        id: i,
        size,
        left,
        fallDuration,
        fallDelay,
        swayDuration,
        opacity,
      }
    })
  }, [count])

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none" aria-hidden="true">
      {flakes.map((f) => (
        <div
          key={f.id}
          className="absolute -top-12 animate-snow-sway"
          style={{
            left: `${f.left}%`,
            animationDuration: `${f.swayDuration}s`,
            opacity: f.opacity,
          }}
        >
          <div
            className="animate-snow-fall rounded-full bg-white/95 shadow-sm shadow-white/30 blur-[0.35px]"
            style={{
              width: `${f.size}px`,
              height: `${f.size}px`,
              animationDuration: `${f.fallDuration}s`,
              animationDelay: `${f.fallDelay}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
