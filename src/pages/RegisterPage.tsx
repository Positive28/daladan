import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { formatUzPhoneInput, isUzPhoneComplete, normalizeUzPhone } from '../utils/phone'

type RegisterMethod = 'password' | 'otp'

export const RegisterPage = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState(formatUzPhoneInput(''))
  const [region, setRegion] = useState('')
  const [district, setDistrict] = useState('')
  const [method, setMethod] = useState<RegisterMethod>('password')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!firstName || !lastName || !phone || !region || !district) {
      setError("Barcha maydonlarni to'ldiring")
      return
    }
    if (!isUzPhoneComplete(phone)) {
      setError("Telefon raqamini to'liq kiriting")
      return
    }
    if (method === 'password' && !password) {
      setError("Parolni kiriting")
      return
    }
    if (!consent) {
      setError("Davom etish uchun shartlarga rozilik bering")
      return
    }
    register({
      fullName: `${firstName} ${lastName}`.trim(),
      phone: normalizeUzPhone(phone),
      region: `${region}, ${district}`,
      password: method === 'password' ? password : undefined,
      authMethod: method,
    })
    navigate('/profile')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-daladan-soft p-4 md:p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <Link to="/" className="mb-6 flex justify-center">
          <img src="/daladan-logo-full.png" alt="Daladan" className="h-14 object-contain" />
        </Link>
        <h1 className="text-4xl font-semibold text-slate-900">Ro&apos;yxatdan o&apos;tish</h1>
        <p className="mt-2 text-base text-slate-600">Kerakli ma&apos;lumotlarni kiriting.</p>

        <div className="mt-5 flex gap-2 rounded-2xl bg-slate-100 p-1 text-base">
          <button
            type="button"
            onClick={() => setMethod('password')}
            className={`flex-1 rounded-xl px-4 py-2.5 font-medium ${
              method === 'password' ? 'bg-white shadow-sm' : 'text-slate-600'
            }`}
          >
            Parol bilan
          </button>
          <button
            type="button"
            onClick={() => setMethod('otp')}
            className={`flex-1 rounded-xl px-4 py-2.5 font-medium ${
              method === 'otp' ? 'bg-white shadow-sm' : 'text-slate-600'
            }`}
          >
            Telegram orqali
          </button>
        </div>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Ism"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
            />
            <input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Familiya"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>
          <input
            value={phone}
            onChange={(event) => setPhone(formatUzPhoneInput(event.target.value))}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder="Viloyat"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
            />
            <input
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              placeholder="Tuman"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          {method === 'password' ? (
            <input
              value={password}
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Parol"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
            />
          ) : (
            <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-700">
              Telegram ulangan telefon raqamingizga OTP kod yuboriladi.
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="h-5 w-5 shrink-0 accent-daladan-primary"
            />
            <span>Foydalanish shartlari va maxfiylik siyosatiga roziman.</span>
          </label>

          <button className="w-full rounded-2xl bg-daladan-primary px-4 py-3 text-xl font-semibold text-white">
            Davom etish
          </button>
        </form>
        {error && <p className="mt-3 text-base text-amber-700">{error}</p>}
        <p className="mt-5 text-lg text-slate-700">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="font-semibold text-daladan-primary">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
