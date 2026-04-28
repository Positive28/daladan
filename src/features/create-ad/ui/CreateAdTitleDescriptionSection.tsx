import { useState } from 'react'
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

const DESCRIPTION_TIPS = [
  { icon: '✏️', text: "Aniq va to'liq yozing — xaridorlar kam savol beradi." },
  { icon: '🔍', text: "Ko'proq ma'lumot qo'shing — e'lonni osonroq topishadi." },
  { icon: '✅', text: "Rostini yozing — xaridorlar ishonadi va yaxshi baho beradi." },
]

const TITLE_TIPS = [
  { icon: '🎯', text: "Qisqa va aniq yozing — asosiy so'zlarni kiriting." },
  { icon: '🔤', text: "Mahsulot nomi, turi va asosiy xususiyatini ko'rsating." },
]

export function CreateAdTitleDescriptionSection({
  register,
  errors,
  handleGenerateDescription,
  isGenerateDescriptionDisabled,
  isGeneratingDescription,
}: Props) {
  const [descFocused, setDescFocused] = useState(false)
  const [titleFocused, setTitleFocused] = useState(false)

  return (
    <section className="space-y-3">
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sarlavha va tavsif</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Avval narx, birlik va yetkazib berishni to&apos;ldiring — AI tavsifda shu ma&apos;lumotlardan foydalanadi.
      </p>

      {/* Title field with tooltip */}
      <div className="relative">
        <input
          {...register('title', {
            required: "Sarlavha kiriting",
            minLength: { value: 3, message: "Sarlavha kamida 3 ta belgidan iborat bo'lsin" },
          })}
          aria-invalid={Boolean(errors.title)}
          placeholder="Sarlavha"
          onFocus={() => setTitleFocused(true)}
          onBlur={() => setTitleFocused(false)}
          className={`w-full rounded-ui border px-3 py-2 text-sm outline-none dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
            Boolean(errors.title),
          )}`}
        />
        {titleFocused && (
          <>
            <span className="pointer-events-none absolute top-3 right-0 z-20 hidden translate-x-[calc(100%+4px)] items-center gap-0.5 text-slate-700 dark:text-slate-300 lg:flex">
              <span className="h-px w-3 bg-slate-700 dark:bg-slate-300" />
              <span className="text-sm font-bold">➡</span>
            </span>
            <div className="pointer-events-none absolute right-0 top-0 z-20 w-72 translate-x-[calc(100%+14px)] rounded-xl bg-slate-800 px-4 py-3 text-sm text-white shadow-xl dark:bg-slate-700 max-lg:hidden">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Maslahat
              </div>
              <ul className="space-y-2">
                {TITLE_TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 leading-snug">
                    <span className="mt-0.5 text-base">{tip.icon}</span>
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

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

      {/* Description field with tooltip */}
      <div className="relative">
        <textarea
          {...register('description', {
            required: "Tavsif kiriting",
            minLength: { value: 10, message: "Tavsif kamida 10 ta belgidan iborat bo'lsin" },
          })}
          rows={7}
          aria-invalid={Boolean(errors.description)}
          placeholder="O'zingizni shu e'lonni ko'rayotgan odam o'rniga qo'ying va tavsif yozing"
          onFocus={() => setDescFocused(true)}
          onBlur={() => setDescFocused(false)}
          className={`w-full resize-y rounded-ui border px-3 py-3 text-sm leading-relaxed outline-none dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
            Boolean(errors.description),
          )}`}
        />
        {descFocused && (
          <>
            <span className="pointer-events-none absolute top-4 right-0 z-20 hidden translate-x-[calc(100%+4px)] items-center gap-0.5 text-slate-700 dark:text-slate-300 lg:flex">
              <span className="h-px w-3 bg-slate-700 dark:bg-slate-300" />
              <span className="text-sm font-bold">➡</span>
            </span>
            <div className="pointer-events-none absolute right-0 top-0 z-20 ml-2 w-64 translate-x-[calc(100%+14px)] rounded-xl bg-slate-800 px-4 py-3 text-sm text-white shadow-xl dark:bg-slate-700 max-lg:hidden">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tavsif yozish bo&apos;yicha maslahat
            </div>
            <ul className="space-y-2.5">
              {DESCRIPTION_TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 leading-snug">
                  <span className="mt-0.5 text-base">{tip.icon}</span>
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>
            </div>
          </>
        )}
      </div>

      {errors.title || errors.description ? (
        <p className={ERROR_TEXT_CLASS}>{errors.title?.message || errors.description?.message}</p>
      ) : null}
    </section>
  )
}
