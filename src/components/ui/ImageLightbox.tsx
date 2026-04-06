import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from 'react'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const WHEEL_ZOOM_STEP = 0.09
const BUTTON_ZOOM_STEP = 0.2

export type ImageLightboxProps = {
  open: boolean
  urls: string[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
  alt?: string
  onImageError?: (e: SyntheticEvent<HTMLImageElement>) => void
}

export function ImageLightbox({
  open,
  urls,
  index,
  onClose,
  onNavigate,
  alt = '',
  onImageError,
}: ImageLightboxProps) {
  const len = urls.length
  const safeIdx = len ? ((index % len) + len) % len : 0
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const panRef = useRef(pan)
  panRef.current = pan
  const scaleRef = useRef(scale)
  scaleRef.current = scale

  const drag = useRef<{ startPanX: number; startPanY: number; originX: number; originY: number } | null>(null)

  useEffect(() => {
    if (!open) return
    setScale(1)
    setPan({ x: 0, y: 0 })
  }, [open, safeIdx])

  const onNavigateRef = useRef(onNavigate)
  onNavigateRef.current = onNavigate

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === '+' || (event.key === '=' && !event.shiftKey)) {
        event.preventDefault()
        setScale((s) => {
          const next = clamp(s + BUTTON_ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)
          if (next === MIN_ZOOM) setPan({ x: 0, y: 0 })
          return next
        })
        return
      }
      if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        setScale((s) => {
          const next = clamp(s - BUTTON_ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)
          if (next === MIN_ZOOM) setPan({ x: 0, y: 0 })
          return next
        })
        return
      }
      if (event.key === '0') {
        event.preventDefault()
        setScale(1)
        setPan({ x: 0, y: 0 })
        return
      }
      if (len <= 1) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onNavigateRef.current((safeIdx - 1 + len) % len)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNavigateRef.current((safeIdx + 1) % len)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, len, safeIdx, onClose])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY > 0 ? -WHEEL_ZOOM_STEP : WHEEL_ZOOM_STEP
    setScale((s) => {
      const next = clamp(s + delta, MIN_ZOOM, MAX_ZOOM)
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 })
      return next
    })
  }, [])

  const startDrag = (e: React.PointerEvent) => {
    if (scaleRef.current <= MIN_ZOOM) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = {
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
      originX: e.clientX,
      originY: e.clientY,
    }
  }

  const moveDrag = (e: React.PointerEvent) => {
    if (!drag.current || scaleRef.current <= MIN_ZOOM) return
    setPan({
      x: drag.current.startPanX + (e.clientX - drag.current.originX),
      y: drag.current.startPanY + (e.clientY - drag.current.originY),
    })
  }

  const endDrag = (e: React.PointerEvent) => {
    drag.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const zoomOut = () => {
    setScale((s) => {
      const next = clamp(s - BUTTON_ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 })
      return next
    })
  }

  const zoomIn = () => {
    setScale((s) => clamp(s + BUTTON_ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))
  }

  if (!open || len === 0) return null

  const src = urls[safeIdx]

  return (
    <div className="fixed inset-0 z-[100] bg-black/85" onClick={onClose} role="presentation">
      <button
        type="button"
        className="pointer-events-auto absolute right-4 top-4 z-20 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Yopish"
      >
        <X size={22} />
      </button>

      {/* pointer-events-none: clicks pass through dimmed padding to backdrop (root onClick closes) */}
      <div className="pointer-events-none flex h-full w-full min-h-0 items-center justify-center p-4 pb-24 pt-14 sm:pb-28">
        <div
          className="pointer-events-auto relative box-border flex h-[min(88vh,88dvh)] w-[min(96vw,96dvw)] min-h-0 min-w-0 shrink-0 touch-none items-center justify-center overflow-hidden"
          onWheel={onWheel}
        >
          {len > 1 ? (
            <>
              <button
                type="button"
                aria-label="Oldingi"
                className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 md:left-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onNavigate((safeIdx - 1 + len) % len)
                }}
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                aria-label="Keyingi"
                className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 md:right-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onNavigate((safeIdx + 1) % len)
                }}
              >
                <ChevronRight size={28} />
              </button>
            </>
          ) : null}

          <div
            key={src}
            className={`max-h-full max-w-full will-change-transform ${
              scale > MIN_ZOOM ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
            }`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setScale((s) => {
                const next = s > MIN_ZOOM ? MIN_ZOOM : 2
                if (next === MIN_ZOOM) setPan({ x: 0, y: 0 })
                return next
              })
            }}
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              onError={onImageError}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[min(88vh,88dvh)] max-w-[min(96vw,96dvw)] object-contain select-none"
            />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-auto absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/55 px-2 py-1.5 text-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Kichraytirish"
          className="rounded-full p-1.5 hover:bg-white/15 disabled:opacity-40"
          disabled={scale <= MIN_ZOOM}
          onClick={zoomOut}
        >
          <ZoomOut size={20} />
        </button>
        <span className="min-w-[3.25rem] text-center text-xs tabular-nums">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          aria-label="Kattalashtirish"
          className="rounded-full p-1.5 hover:bg-white/15 disabled:opacity-40"
          disabled={scale >= MAX_ZOOM}
          onClick={zoomIn}
        >
          <ZoomIn size={20} />
        </button>
      </div>
    </div>
  )
}
