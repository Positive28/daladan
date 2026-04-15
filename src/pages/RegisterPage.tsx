import { useEffect, useState } from 'react'
import { Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { authService } from '../services'
import type { CityOption, RegionOption } from '../services/contracts'
import { useAuth } from '../state/AuthContext'
import { useTheme } from '../state/ThemeContext'
import { formatUzPhoneInput, isUzPhoneComplete, normalizeUzPhone } from '../utils/phone'

interface RegisterFormValues {
  firstName: string
  lastName: string
  regionId: string
  cityId: string
  email: string
  telegram: string
  phone: string
  password: string
  confirmPassword: string
  consent: boolean
}

export const RegisterPage = () => {
  const { theme, toggleTheme } = useTheme()
  const [regions, setRegions] = useState<RegionOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [apiError, setApiError] = useState('')
  const [isLoadingRegions, setIsLoadingRegions] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const {
    register: formRegister,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormValues>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      regionId: '',
      cityId: '',
      email: '',
      telegram: '',
      phone: formatUzPhoneInput(''),
      password: '',
      confirmPassword: '',
      consent: false,
    },
  })

  const selectedRegionId = watch('regionId')
  const passwordValue = watch('password')

  useEffect(() => {
    const loadRegions = async () => {
      setIsLoadingRegions(true)
      try {
        const response = await authService.getRegions()
        setRegions(response)
        const buxoro = response.find((region) => region.name.toLowerCase().includes('buxoro'))
        if (buxoro) {
          setValue('regionId', String(buxoro.id), { shouldValidate: true })
        }
      } catch (loadError) {
        setApiError(loadError instanceof Error ? loadError.message : "Viloyatlar ro'yxatini yuklab bo'lmadi")
      } finally {
        setIsLoadingRegions(false)
      }
    }
    void loadRegions()
  }, [setValue])

  useEffect(() => {
    if (!selectedRegionId) {
      setCities([])
      setValue('cityId', '', { shouldValidate: true })
      return
    }
    const loadCities = async () => {
      setIsLoadingCities(true)
      try {
        const response = await authService.getCities(Number(selectedRegionId))
        setCities(response)
        setValue('cityId', '', { shouldValidate: true })
      } catch (loadError) {
        setApiError(loadError instanceof Error ? loadError.message : "Tumanlar ro'yxatini yuklab bo'lmadi")
      } finally {
        setIsLoadingCities(false)
      }
    }
    void loadCities()
  }, [selectedRegionId, setValue])

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError('')
    try {
      await register({
        fname: values.firstName.trim(),
        lname: values.lastName.trim(),
        phone: normalizeUzPhone(values.phone),
        password: values.password.trim(),
        regionId: Number(values.regionId),
        cityId: Number(values.cityId),
        email: values.email.trim() || undefined,
        telegram: values.telegram.trim() || undefined,
      })
      navigate('/profile')
    } catch (submissionError) {
      setApiError(submissionError instanceof Error ? submissionError.message : "Ro'yxatdan o'tishda xatolik yuz berdi")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-daladan-soft p-4 dark:bg-slate-950 md:p-6">
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
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">Ro&apos;yxatdan o&apos;tish</h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">Kerakli ma&apos;lumotlarni kiriting.</p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              {...formRegister('firstName', { required: "Ismni kiriting" })}
              placeholder="Ism"
              className="w-full rounded-ui border border-slate-300 px-4 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              {...formRegister('lastName', { required: "Familiyani kiriting" })}
              placeholder="Familiya"
              className="w-full rounded-ui border border-slate-300 px-4 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {(errors.firstName || errors.lastName) && (
            <p className="text-sm text-daladan-accentDark">{errors.firstName?.message || errors.lastName?.message}</p>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <select
              {...formRegister('regionId', { required: "Viloyatni tanlang" })}
              disabled={isLoadingRegions}
              className="w-full rounded-ui border border-slate-300 px-4 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Viloyatni tanlang</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <select
              {...formRegister('cityId', { required: "Tumanni tanlang" })}
              disabled={!selectedRegionId || isLoadingCities}
              className="w-full rounded-ui border border-slate-300 px-4 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{isLoadingCities ? 'Yuklanmoqda...' : 'Tumanni tanlang'}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          {(errors.regionId || errors.cityId) && (
            <p className="text-sm text-daladan-accentDark">{errors.regionId?.message || errors.cityId?.message}</p>
          )}
          <input
            {...formRegister('email', {
              validate: (value) =>
                !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Email manzili noto'g'ri",
            })}
            type="email"
            autoComplete="off"
            placeholder="Email (ixtiyoriy)"
            className="w-full rounded-ui border border-slate-300 px-4 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.email && <p className="text-sm text-daladan-accentDark">{errors.email.message}</p>}
          <input
            {...formRegister('telegram')}
            autoComplete="off"
            placeholder="Telegram (ixtiyoriy)"
            className="w-full rounded-ui border border-slate-300 px-4 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <Controller
            control={control}
            name="phone"
            rules={{
              validate: (value) => isUzPhoneComplete(value) || "Telefon raqamini to'liq kiriting",
            }}
            render={({ field }) => (
              <input
                value={field.value}
                onChange={(event) => field.onChange(formatUzPhoneInput(event.target.value))}
                className="w-full rounded-ui border border-slate-300 px-4 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            )}
          />
          {errors.phone && <p className="text-sm text-daladan-accentDark">{errors.phone.message}</p>}

          <div className="relative">
            <input
              {...formRegister('password', { required: "Parolni kiriting" })}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Parol"
              className="w-full rounded-ui border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
              aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              {...formRegister('confirmPassword', {
                required: "Parolni tasdiqlang",
                validate: (value) => value === passwordValue || 'Parollar bir xil emas',
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Parolni tasdiqlang"
              className="w-full rounded-ui border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
              aria-label={showConfirmPassword ? 'Tasdiq parolini yashirish' : "Tasdiq parolini ko'rsatish"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {(errors.password || errors.confirmPassword) && (
            <p className="text-sm text-daladan-accentDark">{errors.password?.message || errors.confirmPassword?.message}</p>
          )}

          <label className="flex cursor-pointer items-center gap-3 rounded-ui border border-slate-200 px-4 py-3 text-sm text-slate-700 select-none dark:border-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              {...formRegister('consent', {
                validate: (value) => value || "Davom etish uchun shartlarga rozilik bering",
              })}
              className="h-5 w-5 shrink-0 accent-daladan-primary"
            />
            <span>Foydalanish shartlari va maxfiylik siyosatiga roziman.</span>
          </label>
          {errors.consent && <p className="text-sm text-daladan-accentDark">{errors.consent.message}</p>}

          <button
            disabled={!isValid || isSubmitting || isLoadingRegions}
            className="w-full rounded-ui bg-daladan-primary px-4 py-3 text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Kutilmoqda...' : 'Davom etish'}
          </button>
        </form>
        {apiError && <p className="mt-3 text-base text-daladan-accentDark">{apiError}</p>}
        <p className="mt-5 text-lg text-slate-700 dark:text-slate-300">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="font-semibold text-daladan-primary">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
