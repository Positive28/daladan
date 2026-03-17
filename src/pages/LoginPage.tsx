import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { formatUzPhoneInput, isUzPhoneComplete, normalizeUzPhone } from '../utils/phone'

export const LoginPage = () => {
  const [phone, setPhone] = useState(formatUzPhoneInput(''))
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { loginWithPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

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
    <div className="flex min-h-screen items-center justify-center bg-daladan-soft p-4 md:p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <Link to="/" className="mb-6 flex justify-center">
          <img src="/daladan-logo-full.png" alt="Daladan" className="h-14 object-contain" />
        </Link>
        <h1 className="text-4xl font-semibold text-slate-900">Kirish</h1>
        <p className="mt-2 text-base text-slate-600">Telefon raqamingiz orqali hisobga kiring.</p>
        <form className="mt-5 space-y-3" onSubmit={submitPassword}>
          <input
            value={phone}
            onChange={(event) => setPhone(formatUzPhoneInput(event.target.value))}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
          />
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Parol"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
          />
          <button
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-daladan-primary px-4 py-3 text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Kutilmoqda...' : 'Kirish'}
          </button>
        </form>

        {error && <p className="mt-3 text-base text-daladan-accentDark">{error}</p>}
        <p className="mt-5 text-lg text-slate-700">
          Hisobingiz yo&apos;qmi?{' '}
          <Link to="/register" className="font-semibold text-daladan-primary">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>
    </div>
  )
}
