import { type CSSProperties, type MouseEvent, useEffect, useMemo } from 'react'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Camera, RefreshCcw, Trash2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export type PhotoUploadSlot = File | { remoteUrl: string } | null

interface PhotoUploadGridProps {
  slots: PhotoUploadSlot[]
  onChange: (nextSlots: PhotoUploadSlot[]) => void
}

const makeSlotIds = (slotCount: number) => Array.from({ length: slotCount }, (_, index) => `photo-slot-${index}`)

interface SortablePhotoSlotProps {
  id: string
  index: number
  slot: PhotoUploadSlot
  previewUrl: string | null
  isCoverSlot: boolean
  onReplace: (nextFile: File) => void
  onDelete: () => void
}

const SortablePhotoSlot = ({ id, index, slot, previewUrl, isCoverSlot, onReplace, onDelete }: SortablePhotoSlotProps) => {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: (acceptedFiles) => {
      const [acceptedFile] = acceptedFiles
      if (acceptedFile) {
        onReplace(acceptedFile)
      }
    },
  })

  const slotStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  }

  const handleOpen = () => {
    open()
  }

  const handleReselect = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    open()
  }

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onDelete()
  }

  return (
    <div ref={setNodeRef} style={slotStyle}>
      <div
        {...getRootProps({
          onClick: handleOpen,
          className: [
            'group relative aspect-[4/3] overflow-hidden rounded-ui border transition',
            'focus-within:ring-2 focus-within:ring-daladan-primary/30',
            slot
              ? 'border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700'
              : 'border-dashed border-slate-300 bg-slate-50 hover:border-daladan-primary/70 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700',
            isCoverSlot && !slot ? 'border-daladan-primary/40 bg-amber-50 dark:bg-amber-500/10' : '',
            isDragActive ? 'border-daladan-primary ring-2 ring-daladan-primary/30' : '',
            isDragging ? 'opacity-75 shadow-xl' : '',
          ]
            .filter(Boolean)
            .join(' '),
        })}
      >
        <input {...getInputProps()} />
        {isCoverSlot ? (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-slate-900/65 px-2 py-1 text-[10px] font-semibold tracking-wide text-white">
            Muqova
          </span>
        ) : null}

        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        />

        {slot && previewUrl ? (
          <>
            <img src={previewUrl} alt={`Yuklangan rasm ${index + 1}`} className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" />
            <div className="absolute inset-x-2 bottom-2 z-10 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                onClick={handleReselect}
                className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow transition hover:bg-slate-100"
              >
                <RefreshCcw size={12} />
                Qayta tanlash
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow transition hover:bg-red-600"
              >
                <Trash2 size={12} />
                O&apos;chirish
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
            <Camera size={22} />
          </div>
        )}
      </div>
    </div>
  )
}

export const PhotoUploadGrid = ({ slots, onChange }: PhotoUploadGridProps) => {
  const slotIds = useMemo(() => makeSlotIds(slots.length), [slots.length])
  const previewUrls = useMemo(
    () =>
      slots.map((slot) => {
        if (!slot) return null
        if (slot instanceof File) return URL.createObjectURL(slot)
        return slot.remoteUrl
      }),
    [slots],
  )

  useEffect(() => {
    return () => {
      slots.forEach((slot, i) => {
        if (slot instanceof File) {
          const url = previewUrls[i]
          if (url) URL.revokeObjectURL(url)
        }
      })
    }
  }, [slots, previewUrls])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const replaceFileAt = (index: number, nextFile: File) => {
    const nextSlots = [...slots]
    nextSlots[index] = nextFile
    onChange(nextSlots)
  }

  const clearFileAt = (index: number) => {
    if (!slots[index]) return
    const nextSlots = [...slots]
    nextSlots[index] = null
    onChange(nextSlots)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return

    const oldIndex = slotIds.indexOf(String(active.id))
    const newIndex = slotIds.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return

    onChange(arrayMove(slots, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={slotIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {slotIds.map((slotId, index) => (
            <SortablePhotoSlot
              key={slotId}
              id={slotId}
              index={index}
              slot={slots[index] ?? null}
              previewUrl={previewUrls[index] ?? null}
              isCoverSlot={index === 0}
              onReplace={(nextFile) => replaceFileAt(index, nextFile)}
              onDelete={() => clearFileAt(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
