import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../state/AuthContext'
import { formatUzPhoneInput, isUzPhoneComplete, normalizeUzPhone } from '../utils/phone'

const looksLikeEmail = (v: string) => v.includes('@')
const looksLikePhone = (v: string) => /^[+\d\s()‑-]/.test(v.trim())

function useSmartInput() {
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<'phone' | 'email'>('phone')

  const onChange = (raw: string) => {
    if (looksLikeEmail(raw)) {
      setMode('email')
      setValue(raw)
      return
    }
    if (looksLikePhone(raw) || raw === '') {
      setMode('phone')
      setValue(raw ? formatUzPhoneInput(raw) : '')
      return
    }
    setMode('email')
    setValue(raw)
  }

  const isValid =
    mode === 'phone'
      ? isUzPhoneComplete(value)
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

  return {
    value,
    onChange,
    mode,
    isValid,
    normalized: mode === 'phone' ? normalizeUzPhone(value) : value.trim(),
  }
}

const inputCls = (invalid?: boolean) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 focus:ring-0 dark:bg-slate-800 dark:text-slate-100 ${
    invalid
      ? 'border-red-300 bg-white'
      : 'border-slate-300 bg-white focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500'
  }`

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

interface RegisterFormValues {
  password: string
  confirmPassword: string
  consent: boolean
}

function RegisterForm({ identity }: { identity: ReturnType<typeof useSmartInput> }) {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormValues>({
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '', consent: false },
  })

  const password = watch('password')

  const onSubmit = async (values: RegisterFormValues) => {
    if (!identity.isValid) return
    setApiError('')
    try {
      await authRegister({
        phone: identity.mode === 'phone' ? identity.normalized : undefined,
        email: identity.mode === 'email' ? identity.normalized : undefined,
        password: values.password.trim(),
      })
      navigate('/profile')
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Ro'yxatdan o'tishda xatolik")
    }
  }

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Parol</label>
        <div className="relative">
          <input
            {...register('password', { required: true })}
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            className={`${inputCls(!!errors.password)} pr-12`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPass((prev) => !prev)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          Parolni tasdiqlang
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword', {
              required: true,
              validate: (value) => value === password || 'Parollar mos emas',
            })}
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            className={`${inputCls(!!errors.confirmPassword)} pr-12`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}

      <label className="flex items-center gap-2.5 text-[13px] text-slate-500 select-none">
        <input
          type="checkbox"
          {...register('consent', { validate: (value) => value || 'Rozilik bering' })}
          className="h-4 w-4 shrink-0 accent-[#2f6d3f]"
        />
        <span>
          <Link to="/terms" className="text-[#2f6d3f] hover:underline">
            Foydalanish shartlari
          </Link>{' '}
          va{' '}
          <Link to="/privacy" className="text-[#2f6d3f] hover:underline">
            maxfiylik siyosati
          </Link>{' '}
          ga roziman
        </span>
      </label>
      {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}

      {apiError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{apiError}</p>}

      <button
        disabled={!identity.isValid || !isValid || isSubmitting}
        className="w-full rounded-lg bg-[#2f6d3f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#285b35] disabled:opacity-40"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
            Yuklanmoqda...
          </span>
        ) : (
          "Ro'yxatdan o'tish"
        )}
      </button>
    </form>
  )
}

function LoginForm({ identity }: { identity: ReturnType<typeof useSmartInput> }) {
  const { loginWithPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!identity.isValid || !password.trim()) return
    setError('')
    setIsSubmitting(true)
    try {
      await loginWithPassword(identity.normalized, password.trim())
      navigate(from)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kirishda xatolik')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-3.5" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Parol</label>
        <div className="relative">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            className={`${inputCls(!!error)} pr-12`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPass((prev) => !prev)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-[#2f6d3f]">
          Parolni unutdingizmi?
        </Link>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <button
        disabled={!identity.isValid || !password.trim() || isSubmitting}
        className="w-full rounded-lg bg-[#2f6d3f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#285b35] disabled:opacity-40"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
            Yuklanmoqda...
          </span>
        ) : (
          'Kirish'
        )}
      </button>
    </form>
  )
}

type Tab = 'login' | 'register'

export const AuthPage = ({ defaultTab = 'login' }: { defaultTab?: Tab }) => {
  const tab: Tab = defaultTab
  const identity = useSmartInput()

  return (
    <div className="auth-page min-h-screen bg-[#ebf2f7] p-4 dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center">
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="px-5 py-5">
            <h1 className="mb-4 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">
              {tab === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
            </h1>

            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Telefon yoki email
              </label>
              <input
                value={identity.value}
                onChange={(event) => identity.onChange(event.target.value)}
                inputMode={identity.mode === 'phone' ? 'tel' : 'email'}
                autoComplete={identity.mode === 'phone' ? 'tel' : 'email'}
                className={inputCls(identity.value.length > 4 && !identity.isValid)}
              />
              {identity.value.length > 4 && !identity.isValid && (
                <p className="mt-1 text-xs text-slate-500">
                  {identity.mode === 'phone' ? "Raqamni to'liq kiriting" : "Email noto'g'ri"}
                </p>
              )}
            </div>

            <div className="min-h-[290px]">
              {tab === 'login' ? <LoginForm identity={identity} /> : <RegisterForm identity={identity} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
