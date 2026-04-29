import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const ForgotPasswordModal = () => {
  const navigate = useNavigate()
  const [identity, setIdentity] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate(-1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  const closeModal = () => {
    navigate(-1)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!identity.trim()) return
    // Placeholder flow until reset-password API/page is wired.
    navigate(-1)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      <button type="button" onClick={closeModal} aria-label="Yopish" className="absolute inset-0" />
      <div className="relative z-10 w-full max-w-[470px] overflow-hidden rounded-[22px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-8 pb-3 pt-8">
          <h2 className="text-[42px] font-semibold leading-none text-slate-900">Parolni tiklash</h2>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Modalni yopish"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} autoComplete="off" className="space-y-4 px-8 pb-8">
          <input
            name="identity"
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
            className="mx-auto block w-[470px] max-w-full rounded-md border border-[#e6e6e6] bg-[rgb(242,239,233)] px-3 py-2.5 text-sm text-[#3b3b3b] outline-none shadow-none transition placeholder:text-[#7a7a7a] focus:bg-white focus:border-[#78c7f6] focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none"
            placeholder="Telefon yoki email"
          />

          <button
            type="submit"
            className="rounded-lg bg-daladan-primary px-6 py-2.5 text-base font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:bg-daladan-primary/90"
          >
            Parolni tiklash
          </button>
        </form>
      </div>
    </div>
  )
}
