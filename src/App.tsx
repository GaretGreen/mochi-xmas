import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Snowfall from './components/Snowfall'
import useFestiveMusic from './hooks/useFestiveMusic'

type Action = 'pet' | 'feed' | 'quit'

type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose?: () => void
}

function Modal({ open, title, children, onClose }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="w-full max-w-[560px] rounded-2xl border border-white/15 bg-slate-950 p-5 text-slate-100 shadow-2xl">
        <h2 id="modal-title" className="mb-2 text-xl font-semibold">{title}</h2>
        <div className="mb-4">{children}</div>
        <button
          className="w-full rounded-xl bg-lime-500 px-4 py-3 font-semibold text-black transition hover:bg-lime-400"
          autoFocus
          onClick={onClose}
          aria-label="Close dialog"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [action, setAction] = useState<Action | null>(null)
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [reaction, setReaction] = useState('')
  const { enabled: musicOn, toggle: toggleMusic, supported: musicSupported } = useFestiveMusic()

  // Eagerly import any images placed in the top-level photos/ folder
  const imageUrls = useMemo<string[]>(() => {
    const modules = import.meta.glob('../photos/*.{png,jpg,jpeg,webp,gif}', {
      query: '?url',
      import: 'default',
      eager: true,
    }) as Record<string, string>

    return Object.values(modules)
  }, [])

  const titleFor = (a: Action | null) => {
    switch (a) {
      case 'pet':
        return 'You pet Mochi! 🐾'
      case 'feed':
        return 'You fed Mochi! 🍣'
      case 'quit':
        return 'Thanks for playing! 🎄'
      default:
        return ''
    }
  }

  const messageFor = (a: Action) => {
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
    switch (a) {
      case 'pet':
        return pick([
          'Mochi (a.k.a. “Mochi-Bär”) purrs contentedly.',
          'Mochi leans in for more scritches.',
          'You have been blessed by the Mochi-Bär.',
        ])
      case 'feed':
        return pick([
          'Yum! Mochi-Bär enjoyed the snack.',
          'Chomp chomp… happy Mochi noises.',
          'Mochi does the tiniest little “thank you” blink.',
        ])
      case 'quit':
        return pick([
          'Thanks for playing — come back anytime.',
          'Until next time. Mochi-Bär will be here.',
          'Bye for now — give Mochi a pet later!',
        ])
    }
  }

  const pickRandomImage = () => {
    if (!imageUrls.length) return null
    const idx = Math.floor(Math.random() * imageUrls.length)
    return imageUrls[idx]
  }

  const onChoose = (a: Action) => {
    setAction(a)
    setImageUrl(pickRandomImage())
    setReaction(messageFor(a))
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
    setAction(null)
    setReaction('')
  }

  return (
    <div className="min-h-dvh bg-slate-900 text-slate-100">
      <Snowfall />
      <div className="mx-auto w-full max-w-4xl px-4 py-10 text-center">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Mochi-Bär</h1>
          <p className="mt-2 text-slate-200/80">A tiny Christmas surprise</p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:border-lime-400 disabled:opacity-50"
              onClick={toggleMusic}
              aria-pressed={musicOn}
              disabled={!musicSupported}
              title={musicSupported ? 'Toggle background music' : 'Audio not supported in this browser'}
            >
              Music: {musicOn ? 'On' : 'Off'}
            </button>
          </div>
        </header>

        <div className="mt-8 flex justify-center">
          {imageUrls.length ? (
            <img
              className="h-auto w-[min(420px,90vw)] rounded-2xl shadow-2xl"
              src={imageUrls[0]}
              alt="Mochi the cat"
              loading="eager"
            />
          ) : (
            <div
              className="grid h-60 w-60 place-items-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-7xl shadow-2xl"
              aria-label="Mochi image placeholder"
            >
              🐱
            </div>
          )}
        </div>

        <div
          className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3"
          role="group"
          aria-label="Choose an action"
        >
          <button
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-lg font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-lime-400"
            onClick={() => onChoose('pet')}
          >
            Pet Mochi
          </button>
          <button
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-lg font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-lime-400"
            onClick={() => onChoose('feed')}
          >
            Feed Mochi
          </button>
          <button
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-lg font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-lime-400"
            onClick={() => onChoose('quit')}
          >
            Quit
          </button>
        </div>

        <footer className="mt-10 text-sm text-slate-200/60">Made with ❤️ for Mochi</footer>

        <Modal open={open} title={titleFor(action)} onClose={onClose}>
          {imageUrl ? (
            <img className="mb-3 w-full rounded-xl" src={imageUrl} alt="Mochi reaction" loading="lazy" />
          ) : null}
          <p>{reaction}</p>
        </Modal>
      </div>
    </div>
  )
}
