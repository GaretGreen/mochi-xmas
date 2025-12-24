import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { FaCog } from "react-icons/fa";
import { IoMdClose } from 'react-icons/io';
import Snowfall from './components/Snowfall'
import useMidiMusic from './hooks/useMidiMusic'

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
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 overflow-auto"
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
          className="w-full rounded-md bg-lime-500 px-4 py-3 font-semibold text-black transition hover:bg-lime-400"
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
  const [snowOn, setSnowOn] = useState(true)
  const [controlsOpen, setControlsOpen] = useState(false)
  const {
    enabled: musicOn,
    toggle: toggleMusic,
    supported: musicSupported,
    loop: musicLoop,
    setLoop: setMusicLoop,
    melodyId,
    setMelodyId,
    melodies,
  } = useMidiMusic()

  // Eagerly import any images placed in the top-level photos/ folder
  const imageUrls = useMemo<string[]>(() => {
    const modules = import.meta.glob('../photos/*.{png,jpg,jpeg,webp,gif}', {
      query: '?url',
      import: 'default',
      eager: true,
    }) as Record<string, string>

    return Object.values(modules)
  }, [])

  const xmasImageUrls = useMemo<string[]>(() => {
    const modules = import.meta.glob('../photos/xmas/*.{png,jpg,jpeg,webp,gif}', {
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
          "You can't leave yet — you haven't pet Mochi enough!",
          "Not so fast… you can't leave yet. Mochi still needs more pets!",
          "You can't leave yet — Mochi-Bär demands additional scritches.",
          "Nope! You can't leave yet. Pet Mochi a little more first.",
          "Escape denied: you can't leave yet — you haven't pet Mochi enough.",
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
      {snowOn ? <Snowfall /> : null}

      <button
        type="button"
        className="fixed right-3 top-3 z-50 h-11 w-11 rounded-2xl border border-white/15 bg-slate-950/70 text-2xl leading-none text-slate-100 backdrop-blur sm:hidden flex items-center justify-center shadow-2xl transition hover:border-lime-400"
        aria-label={controlsOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={controlsOpen}
        onClick={() => setControlsOpen((v) => !v)}
      >
       {controlsOpen ? <IoMdClose /> : <FaCog />}
      </button>

      <div
        className={
          `fixed left-2 right-2 top-2 z-40 flex-col gap-1.5 rounded-2xl border border-white/15 bg-slate-950/60 p-2 text-left text-xs text-slate-200/80 backdrop-blur ` +
          `sm:left-auto sm:right-4 sm:top-4 sm:w-56 sm:gap-2 sm:p-3 sm:text-sm ` +
          (controlsOpen ? 'flex sm:flex' : 'hidden sm:flex')
        }
      >
        <label className="-mx-2 -my-1 flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/5 hover:text-slate-100">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-slate-950/60 accent-lime-400 transition-shadow hover:ring hover:ring-lime-400"
            checked={snowOn}
            onChange={(e) => setSnowOn(e.target.checked)}
          />
          <span className="whitespace-nowrap">Snowfall</span>
        </label>

        <label
          className="-mx-2 -my-1 flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/5 hover:text-slate-100"
          title={musicSupported ? 'Toggle background music' : 'Audio not supported in this browser'}
        >
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-slate-950/60 accent-lime-400 transition-shadow hover:ring hover:ring-lime-400"
            checked={musicOn}
            onChange={(e) => {
              if (e.target.checked !== musicOn) toggleMusic()
            }}
            disabled={!musicSupported}
          />
          <span className="whitespace-nowrap">Music</span>
        </label>

        <label className="flex flex-col gap-1">
          {/* <span className="whitespace-nowrap text-xs">Melody</span> */}
          <select
            className="w-full rounded-md border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 backdrop-blur transition hover:border-lime-400"
            value={melodyId}
            onChange={(e) => setMelodyId(e.target.value as typeof melodyId)}
            disabled={!musicSupported}
          >
            {melodies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="-mx-2 -my-1 flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/5 hover:text-slate-100">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-slate-950/60 accent-lime-400 transition-shadow hover:ring hover:ring-lime-400"
            checked={musicLoop}
            onChange={(e) => setMusicLoop(e.target.checked)}
            disabled={!musicSupported}
          />
          <span className="whitespace-nowrap">Loop music</span>
        </label>
      </div>
      <div
        className={
          `mx-auto w-full max-w-4xl px-4 pb-10 text-center ` +
          (controlsOpen ? 'pt-28 sm:pt-10' : 'pt-16 sm:pt-10')
        }
      >
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Mochi-Bär</h1>
          <p className="mt-2 text-slate-200/80">A tiny Christmas surprise</p>
        </header>

        <div className="mt-8 flex justify-center">
          {imageUrls.length ? (
            <img
              className="h-auto w-[min(420px,90vw)] rounded-2xl shadow-2xl"
              src={xmasImageUrls[0]}
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
            className="rounded-md border border-white/15 bg-white/5 px-4 py-3 text-lg font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-lime-400"
            onClick={() => onChoose('pet')}
          >
            Pet Mochi
          </button>
          <button
            className="rounded-md border border-white/15 bg-white/5 px-4 py-3 text-lg font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-lime-400"
            onClick={() => onChoose('feed')}
          >
            Feed Mochi
          </button>
          <button
            className="rounded-md border border-white/15 bg-white/5 px-4 py-3 text-lg font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-lime-400"
            onClick={() => onChoose('quit')}
          >
            Quit
          </button>
        </div>

        <footer className="mt-10 text-sm text-slate-200/60">Made with ❤️ for Mochibär Appreciation Cave members</footer>

        <Modal open={open} title={titleFor(action)} onClose={onClose}>
          {imageUrl ? (
            <img className="mb-3 mx-auto h-100 rounded-md" src={imageUrl} alt="Mochi reaction" loading="lazy" />
          ) : null}
          <p>{reaction}</p>
        </Modal>
      </div>
    </div>
  )
}
