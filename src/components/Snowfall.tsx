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

export default function Snowfall({ count = 40 }: { count?: number }) {
  const flakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const rnd = mulberry32(i + 1)
      const size = 2 + rnd() * 5
      const left = rnd() * 100
      const fallDuration = 7 + rnd() * 10
      const fallDelay = -rnd() * fallDuration
      const swayDuration = 3 + rnd() * 4
      const opacity = 0.35 + rnd() * 0.5

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
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
      {flakes.map((f) => (
        <div
          key={f.id}
          className="absolute top-[-10vh] animate-snow-sway"
          style={{
            left: `${f.left}%`,
            animationDuration: `${f.swayDuration}s`,
            opacity: f.opacity,
          }}
        >
          <div
            className="h-2 w-2 animate-snow-fall rounded-full bg-white/90 blur-[0.2px]"
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
