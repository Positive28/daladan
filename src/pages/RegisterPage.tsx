import { useState } from 'react'
import { Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '../state/AuthContext'
import { useTheme } from '../state/ThemeContext'
import { LOGIN_PATH } from '../utils/appPaths'
import { formatUzPhoneInput, isUzPhoneComplete, normalizeUzPhone } from '../utils/phone'

interface RegisterFormValues {
  phone: string
  password: string
  confirmPassword: string
  consent: boolean
}

export const RegisterPage = () => {
  const { theme, toggleTheme } = useTheme()
  const [apiError, setApiError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const {
    register: formRegister,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormValues>({
    mode: 'onChange',
    defaultValues: {
      phone: formatUzPhoneInput(''),
      password: '',
      confirmPassword: '',
      consent: false,
    },
  })

  const passwordValue = watch('password')

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError('')
    try {
      await register({
        phone: normalizeUzPhone(values.phone),
        password: values.password.trim(),
      })
      navigate('/profile')
    } catch (submissionError) {
      setApiError(
        submissionError instanceof Error
          ? submissionError.message
          : "Ro'yxatdan o'tishda xatolik yuz berdi",
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md">

        {/* Theme toggle */}
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label={theme === 'dark' ? "Yorug' rejim" : "Qorong'i rejim"}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* Logo */}
          <Link to="/" className="mb-8 flex justify-center">
            <img
              src="/daladan-logo-full-transparent.png"
              alt="Daladan"
              className="h-11 object-contain dark:brightness-0 dark:invert"
            />
          </Link>

          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Hisob yaratish
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Quyidagi ma&apos;lumotlarni kiriting
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Telefon raqam
              </label>
              <Controller
                control={control}
                name="phone"
                rules={{
                  validate: (v) => isUzPhoneComplete(v) || "Telefon raqamini to'liq kiriting",
                }}
                render={({ field }) => (
                  <input
                    value={field.value}
                    onChange={(e) => field.onChange(formatUzPhoneInput(e.target.value))}
                    inputMode="tel"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600 ${
                      errors.phone
                        ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 dark:border-red-500 dark:bg-red-900/10'
                        : 'border-slate-300 bg-white focus:border-[#2f6d3f] focus:ring-2 focus:ring-[#2f6d3f]/15 dark:border-slate-700'
                    }`}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Parol
              </label>
              <div className="relative">
                <input
                  {...formRegister('password', { required: 'Parolni kiriting' })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Kamida 6 ta belgi"
                  className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600 ${
                    errors.password
                      ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 dark:border-red-500 dark:bg-red-900/10'
                      : 'border-slate-300 bg-white focus:border-[#2f6d3f] focus:ring-2 focus:ring-[#2f6d3f]/15 dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <input
                  {...formRegister('confirmPassword', {
                    required: 'Parolni tasdiqlang',
                    validate: (v) => v === passwordValue || 'Parollar mos kelmadi',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Parolni qayta kiriting"
                  className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600 ${
                    errors.confirmPassword
                      ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 dark:border-red-500 dark:bg-red-900/10'
                      : 'border-slate-300 bg-white focus:border-[#2f6d3f] focus:ring-2 focus:ring-[#2f6d3f]/15 dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Consent */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 select-none dark:border-slate-700 dark:bg-slate-800/50">
              <input
                type="checkbox"
                {...formRegister('consent', {
                  validate: (v) => v || 'Shartlarga rozilik bering',
                })}
                className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#2f6d3f]"
              />
              <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <Link to="/terms" className="font-medium text-[#2f6d3f] hover:underline">
                  Foydalanish shartlari
                </Link>{' '}
                va{' '}
                <Link to="/privacy" className="font-medium text-[#2f6d3f] hover:underline">
                  maxfiylik siyosati
                </Link>
                ga roziman
              </span>
            </label>
            {errors.consent && (
              <p className="text-xs text-red-500">{errors.consent.message}</p>
            )}

            {apiError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {apiError}
              </div>
            )}

            <button
              disabled={!isValid || isSubmitting}
              className="mt-1 w-full rounded-lg bg-[#2f6d3f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#265c35] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Yuklanmoqda…
                </span>
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-500">
          Hisobingiz bormi?{' '}
          <Link
            to={LOGIN_PATH}
            className="font-semibold text-[#2f6d3f] hover:underline dark:text-[#4a9a5f]"
          >
            Kirish
          </Link>
        </p>

      </div>
    </div>
  )
}
