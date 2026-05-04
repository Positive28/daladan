import { useEffect, useState, type FormEvent } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useTheme } from '../state/ThemeContext'
import { formatUzPhoneInput, isUzPhoneComplete, normalizeUzPhone } from '../utils/phone'

type LoginPageProps = {
  variant?: 'site' | 'admin'
}

export const LoginPage = ({ variant = 'site' }: LoginPageProps) => {
  const { theme, toggleTheme } = useTheme()
  const [phone, setPhone] = useState(formatUzPhoneInput(''))
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { loginWithPassword, user, isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate(from, { replace: true })
    }
  }, [isAuthLoading, user, navigate, from])

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault()
    if (!isUzPhoneComplete(phone)) {
      setError("Telefon raqamini to'liq kiriting")
      return
    }
    if (!password.trim()) {
      setError("Parolni kiriting")
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await loginWithPassword(normalizeUzPhone(phone), password.trim())
      navigate(from)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Kirishda xatolik yuz berdi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ebf2f7] p-4 dark:bg-slate-950 md:p-6">
      <div className="relative w-full max-w-lg rounded-ui border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          aria-label={theme === 'dark' ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Link to="/" className="mb-6 flex justify-center">
          <img src="/daladan-logo-full-transparent.png" alt="Daladan" className="h-14 object-contain" />
        </Link>
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
          {variant === 'admin' ? 'Admin paneliga kirish' : 'Kirish'}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          {variant === 'admin'
            ? 'Admin akkauntingiz bilan tizimga kiring.'
            : 'Telefon raqamingiz orqali hisobga kiring.'}
        </p>
        <form className="mt-5 space-y-3" onSubmit={submitPassword}>
          <input
            value={phone}
            onChange={(event) => setPhone(formatUzPhoneInput(event.target.value))}
            className="w-full rounded-ui border border-slate-300 px-4 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Parol"
            className="w-full rounded-ui border border-slate-300 px-4 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            disabled={isSubmitting}
            className="w-full rounded-ui bg-daladan-primary px-4 py-3 text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Kutilmoqda...' : 'Kirish'}
          </button>
        </form>

        {error && <p className="mt-3 text-base text-daladan-accentDark">{error}</p>}
        {variant === 'site' ? (
          <p className="mt-5 text-lg text-slate-700 dark:text-slate-300">
            Hisobingiz yo&apos;qmi?{' '}
            <Link to="/register" className="font-semibold text-daladan-primary">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  )
}
