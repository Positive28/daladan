import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ERROR_TEXT_CLASS, getFieldBorderClass } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  handleGenerateDescription: () => void | Promise<void>
  isGenerateDescriptionDisabled: boolean
  isGeneratingDescription: boolean
}

export function CreateAdTitleDescriptionSection({
  register,
  errors,
  handleGenerateDescription,
  isGenerateDescriptionDisabled,
  isGeneratingDescription,
}: Props) {
  return (
    <section className="space-y-3">
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sarlavha va tavsif</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Avval narx, birlik va yetkazib berishni to&apos;ldiring — AI tavsifda shu ma&apos;lumotlardan foydalanadi.
      </p>
      <input
        {...register('title', {
          required: "Sarlavha kiriting",
          minLength: { value: 3, message: "Sarlavha kamida 3 ta belgidan iborat bo'lsin" },
        })}
        aria-invalid={Boolean(errors.title)}
        placeholder="Sarlavha"
        className={`rounded-ui border px-3 py-2 text-sm outline-none dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
          Boolean(errors.title),
        )}`}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tavsifni yuqoridagi maydonlar (joylashuv, narx, birlik, yetkazib berish) asosida AI bilan yarating.
        </p>
        <button
          type="button"
          onClick={() => {
            void handleGenerateDescription()
          }}
          disabled={isGenerateDescriptionDisabled}
          className="rounded-ui border border-daladan-primary/40 px-3 py-2 text-xs font-semibold text-daladan-primary transition-colors hover:bg-daladan-primary/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-daladan-primary/60"
        >
          {isGeneratingDescription ? 'Yaratilmoqda...' : 'AI yordamida tavsif yaratish'}
        </button>
      </div>
      <textarea
        {...register('description', {
          required: "Tavsif kiriting",
          minLength: { value: 10, message: "Tavsif kamida 10 ta belgidan iborat bo'lsin" },
        })}
        rows={14}
        aria-invalid={Boolean(errors.description)}
        placeholder="Tavsif"
        className={`min-h-[min(28rem,70vh)] w-full resize-y rounded-ui border px-3 py-3 text-base leading-relaxed outline-none dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
          Boolean(errors.description),
        )}`}
      />
      {errors.title || errors.description ? (
        <p className={ERROR_TEXT_CLASS}>{errors.title?.message || errors.description?.message}</p>
      ) : null}
    </section>
  )
}
