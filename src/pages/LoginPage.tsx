import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { formatUzPhoneInput, isUzPhoneComplete, normalizeUzPhone } from '../utils/phone'

type LoginMode = 'password' | 'otp'

export const LoginPage = () => {
  const [mode, setMode] = useState<LoginMode>('password')
  const [phone, setPhone] = useState(formatUzPhoneInput(''))
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const { loginWithPassword, requestOtp, loginWithOtp, pendingOtpPhone } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const submitPassword = (event: FormEvent) => {
    event.preventDefault()
    if (!isUzPhoneComplete(phone)) {
      setError("Telefon raqamini to'liq kiriting")
      return
    }
    setError('')
    loginWithPassword(normalizeUzPhone(phone))
    navigate(from)
  }

  const submitOtp = (event: FormEvent) => {
    event.preventDefault()
    if (!isUzPhoneComplete(phone)) {
      setError("Telefon raqamini to'liq kiriting")
      return
    }
    if (!pendingOtpPhone) {
      requestOtp(normalizeUzPhone(phone))
      setError('Telegramga kod yuborildi (demo: 1234)')
      return
    }
    if (!loginWithOtp(otp)) {
      setError("Kod noto'g'ri. Qayta urinib ko'ring. (demo: 1234)")
      return
    }
    navigate(from)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-daladan-soft p-4 md:p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <Link to="/" className="mb-6 flex justify-center">
          <img src="/daladan-logo-full.png" alt="Daladan" className="h-14 object-contain" />
        </Link>
        <h1 className="text-4xl font-semibold text-slate-900">Kirish</h1>
        <p className="mt-2 text-base text-slate-600">Telefon raqamingiz orqali hisobga kiring.</p>
        <div className="mt-5 flex gap-2 rounded-2xl bg-slate-100 p-1 text-base">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`flex-1 rounded-xl px-4 py-2.5 font-medium ${
              mode === 'password' ? 'bg-white shadow-sm' : 'text-slate-600'
            }`}
          >
            Parol
          </button>
          <button
            type="button"
            onClick={() => setMode('otp')}
            className={`flex-1 rounded-xl px-4 py-2.5 font-medium ${
              mode === 'otp' ? 'bg-white shadow-sm' : 'text-slate-600'
            }`}
          >
            Telegram orqali
          </button>
        </div>

        {mode === 'password' ? (
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
            <button className="w-full rounded-2xl bg-daladan-primary px-4 py-3 text-xl font-semibold text-white">
              Kirish
            </button>
          </form>
        ) : (
          <form className="mt-5 space-y-3" onSubmit={submitOtp}>
            <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-700">
              1) Telegram ulangan telefon raqamingizni kiriting.
              <br />
              2) Tizim shu raqamning Telegram akkauntiga kod yuboradi.
              <br />
              3) Kodni kiriting va hisobga kiring.
            </div>
            <input
              value={phone}
              onChange={(event) => setPhone(formatUzPhoneInput(event.target.value))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
            />
            {pendingOtpPhone && (
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="4 xonali kod"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
              />
            )}
            <button className="w-full rounded-2xl bg-daladan-primary px-4 py-3 text-xl font-semibold text-white">
              {pendingOtpPhone ? 'Kod bilan kirish' : 'Telegramga kod yuborish'}
            </button>
          </form>
        )}

        {error && <p className="mt-3 text-base text-amber-700">{error}</p>}
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
