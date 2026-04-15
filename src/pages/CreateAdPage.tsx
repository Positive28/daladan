import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { PhotoUploadGrid } from '../components/marketplace/PhotoUploadGrid'
import { ApiError } from '../services/apiClient'
import { aiService, authService, marketplaceService, profileService } from '../services'
import type { CityOption, RegionOption } from '../services/contracts'
import { useAuth } from '../state/AuthContext'
import type { CategoryOption, SubcategoryOption } from '../types/marketplace'
import { formatPriceInput, parsePriceInput } from '../utils/price'

interface CreateAdFormValues {
  categoryId: string
  subcategoryId: string
  regionId: string
  cityId: string
  title: string
  description: string
  price: string
  unit: string
  deliveryAvailable: boolean
}

const UNIT_OPTIONS = [
  'kg',
  'gramm',
  'tonna',
  'litr',
  'millilitr',
  'dona',
  'juft',
  'quti',
  'qop',
  'savat',
  'banka',
  "bog'lam",
  'paqir',
  'metr',
  'santimetr',
  'm2',
  'm3',
  'sotix',
  'gektar',
  'bosh',
  "to'plam",
  'karobka',
  'paket',
]

const getFieldBorderClass = (hasError: boolean) =>
  hasError
    ? 'border-red-500 dark:border-red-400'
    : 'border-slate-200 dark:border-slate-600'

const getSelectClass = (hasError: boolean) =>
  `w-full appearance-none rounded-ui border px-3 py-2 pr-10 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-daladan-primary/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
    hasError,
  )}`

const SELECT_ICON_CLASS =
  'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'

const ERROR_TEXT_CLASS = 'text-sm font-medium text-red-600 dark:text-red-400'
const PHOTO_UPLOAD_SLOT_COUNT = 8
const createEmptyPhotoSlots = () => Array.from({ length: PHOTO_UPLOAD_SLOT_COUNT }, () => null as File | null)

export const CreateAdPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [photoSlots, setPhotoSlots] = useState(createEmptyPhotoSlots)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([])
  const [regions, setRegions] = useState<RegionOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false)
  const [isLoadingRegions, setIsLoadingRegions] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [error, setError] = useState('')
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false)
  const [unitHighlightedIndex, setUnitHighlightedIndex] = useState(-1)
  const pendingDefaultCityIdRef = useRef<string>('')
  const unitFieldWrapperRef = useRef<HTMLDivElement | null>(null)
  const unitInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateAdFormValues>({
    mode: 'onChange',
    defaultValues: {
      categoryId: '',
      subcategoryId: '',
      regionId: '',
      cityId: '',
      title: '',
      description: '',
      price: '',
      unit: '',
      deliveryAvailable: true,
    },
  })

  const selectedCategoryId = watch('categoryId')
  const selectedSubcategoryId = watch('subcategoryId')
  const selectedRegionId = watch('regionId')
  const selectedCityId = watch('cityId')
  const priceValue = watch('price')
  const unitValue = watch('unit')
  const deliveryAvailable = watch('deliveryAvailable')
  const hasPriceValue = priceValue.trim().length > 0
  const files = useMemo(() => photoSlots.filter((slot): slot is File => slot instanceof File), [photoSlots])
  const isGenerateDescriptionDisabled =
    !selectedCategoryId ||
    !selectedSubcategoryId ||
    !priceValue.trim() ||
    !unitValue.trim() ||
    isLoadingCategories ||
    isLoadingSubcategories ||
    isGeneratingDescription

  const unitSuggestions = useMemo(() => {
    const query = unitValue.trim().toLowerCase()
    if (!query) return UNIT_OPTIONS
    return UNIT_OPTIONS.filter((unit) => unit.toLowerCase().includes(query))
  }, [unitValue])

  const unitRegister = register('unit', { required: 'Birlik tanlang' })

  const selectUnitSuggestion = (unit: string) => {
    setValue('unit', unit, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
    clearErrors('unit')
    setIsUnitDropdownOpen(false)
    setUnitHighlightedIndex(-1)
    unitInputRef.current?.focus()
  }

  useEffect(() => {
    const closeUnitDropdownOnOutsideClick = (event: MouseEvent) => {
      if (!unitFieldWrapperRef.current) return
      const target = event.target
      if (target instanceof Node && !unitFieldWrapperRef.current.contains(target)) {
        setIsUnitDropdownOpen(false)
      }
    }

    window.addEventListener('mousedown', closeUnitDropdownOnOutsideClick)
    return () => {
      window.removeEventListener('mousedown', closeUnitDropdownOnOutsideClick)
    }
  }, [])

  useEffect(() => {
    if (unitSuggestions.length === 0) {
      setUnitHighlightedIndex(-1)
      return
    }
    setUnitHighlightedIndex((prev) => {
      if (prev < 0) return 0
      if (prev >= unitSuggestions.length) return unitSuggestions.length - 1
      return prev
    })
  }, [unitSuggestions.length])

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const items = await marketplaceService.getCategories()
        if (!isMounted) return
        setCategories(items)
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError instanceof Error ? loadError.message : 'Kategoriyalarni yuklab bo\'lmadi')
      } finally {
        if (isMounted) setIsLoadingCategories(false)
      }
    }

    void loadCategories()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategories([])
      setValue('subcategoryId', '', { shouldValidate: false })
      clearErrors('subcategoryId')
      return
    }

    let isMounted = true

    const loadSubcategories = async () => {
      setIsLoadingSubcategories(true)
      try {
        const items = await marketplaceService.getSubcategories(Number(selectedCategoryId))
        if (!isMounted) return
        setSubcategories(items)
        const currentSubcategoryId = getValues('subcategoryId')
        if (currentSubcategoryId && items.some((item) => String(item.id) === currentSubcategoryId)) {
          return
        }
        setValue('subcategoryId', '', { shouldValidate: true })
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError instanceof Error ? loadError.message : 'Subkategoriyalarni yuklab bo\'lmadi')
      } finally {
        if (isMounted) setIsLoadingSubcategories(false)
      }
    }

    void loadSubcategories()
    return () => {
      isMounted = false
    }
  }, [clearErrors, selectedCategoryId, getValues, setValue])

  useEffect(() => {
    let isMounted = true

    const loadRegionsAndDefaults = async () => {
      setIsLoadingRegions(true)
      try {
        const [regionsResponse, profile] = await Promise.all([
          authService.getRegions(),
          profileService.getProfile().catch(() => null),
        ])
        if (!isMounted) return
        setRegions(regionsResponse)

        let preferredRegionId = profile?.regionId ? String(profile.regionId) : ''
        if (!preferredRegionId) {
          const preferredLocationText = profile?.region || user?.region || ''
          if (preferredLocationText) {
            const matchedRegion = regionsResponse.find((region) =>
              preferredLocationText.toLowerCase().includes(region.name.toLowerCase()),
            )
            if (matchedRegion) preferredRegionId = String(matchedRegion.id)
          }
        }

        setValue('regionId', preferredRegionId, { shouldValidate: false })
        if (preferredRegionId) {
          clearErrors('regionId')
        }
        pendingDefaultCityIdRef.current = profile?.cityId ? String(profile.cityId) : ''
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError instanceof Error ? loadError.message : "Hududlarni yuklab bo'lmadi")
      } finally {
        if (isMounted) setIsLoadingRegions(false)
      }
    }

    void loadRegionsAndDefaults()
    return () => {
      isMounted = false
    }
  }, [clearErrors, setValue, user?.region])

  useEffect(() => {
    if (!selectedRegionId) {
      setCities([])
      setValue('cityId', '', { shouldValidate: false })
      clearErrors('cityId')
      return
    }

    let isMounted = true

    const loadCities = async () => {
      setIsLoadingCities(true)
      try {
        const response = await authService.getCities(Number(selectedRegionId))
        if (!isMounted) return
        setCities(response)

        const currentCityId = getValues('cityId')
        if (currentCityId && response.some((city) => String(city.id) === currentCityId)) {
          return
        }

        let preferredCityId = ''
        if (pendingDefaultCityIdRef.current && response.some((city) => String(city.id) === pendingDefaultCityIdRef.current)) {
          preferredCityId = pendingDefaultCityIdRef.current
        } else if (user?.region) {
          const matchedCity = response.find((city) => user.region.toLowerCase().includes(city.name.toLowerCase()))
          if (matchedCity) preferredCityId = String(matchedCity.id)
        }

        pendingDefaultCityIdRef.current = ''
        setValue('cityId', preferredCityId, { shouldValidate: false })
        if (preferredCityId) {
          clearErrors('cityId')
        }
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError instanceof Error ? loadError.message : "Tumanlarni yuklab bo'lmadi")
      } finally {
        if (isMounted) setIsLoadingCities(false)
      }
    }

    void loadCities()
    return () => {
      isMounted = false
    }
  }, [clearErrors, selectedRegionId, getValues, setValue, user?.region])

  const handleGenerateDescription = useCallback(async () => {
    setError('')

    if (!selectedCategoryId || !selectedSubcategoryId) {
      setError('Avval kategoriya va subkategoriyani tanlang')
      return
    }

    const priceText = getValues('price').trim()
    const unit = getValues('unit').trim()
    if (!priceText) {
      setError('AI uchun avval narx kiriting')
      return
    }
    if (!unit) {
      setError('AI uchun avval birlik tanlang')
      return
    }

    if (isLoadingCategories || isLoadingSubcategories || isGeneratingDescription) {
      return
    }

    const selectedCategory = categories.find((item) => String(item.id) === selectedCategoryId)
    const selectedSubcategory = subcategories.find((item) => String(item.id) === selectedSubcategoryId)

    if (!selectedCategory || !selectedSubcategory) {
      setError("Kategoriya ma'lumotlarini topib bo'lmadi. Qayta urinib ko'ring.")
      return
    }

    const deliveryAvailable = getValues('deliveryAvailable')
    const selectedRegion = regions.find((item) => String(item.id) === selectedRegionId)
    const selectedCity = cities.find((item) => String(item.id) === selectedCityId)

    setIsGeneratingDescription(true)
    try {
      const title = getValues('title').trim()
      const description = await aiService.generateAdDescription({
        categoryName: selectedCategory.name,
        subcategoryName: selectedSubcategory.name,
        title: title || undefined,
        priceText,
        unit,
        deliveryAvailable,
        regionName: selectedRegion?.name,
        districtName: selectedCity?.name,
      })

      setValue('description', description, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
      clearErrors('description')
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "AI tavsifni yaratib bo'lmadi")
    } finally {
      setIsGeneratingDescription(false)
    }
  },
    [
      categories,
      cities,
      clearErrors,
      getValues,
      isGeneratingDescription,
      isLoadingCategories,
      isLoadingSubcategories,
      regions,
      selectedCategoryId,
      selectedCityId,
      selectedRegionId,
      selectedSubcategoryId,
      setValue,
      subcategories,
    ],
  )

  const onSubmit = async (values: CreateAdFormValues) => {
    setError('')

    if (files.length === 0) {
      setError('Kamida bitta rasm yuklang')
      return
    }

    const categoryId = Number(values.categoryId)
    const subcategoryId = Number(values.subcategoryId)
    const regionId = Number(values.regionId)
    const cityId = Number(values.cityId)

    const parsedPrice = parsePriceInput(values.price)
    if (!values.price.trim() || parsedPrice === undefined || parsedPrice <= 0) {
      setError("Narx kiriting (to'g'ri raqam)")
      return
    }

    const selectedCity = cities.find((city) => String(city.id) === values.cityId)

    try {
      await marketplaceService.createProfileAd({
        category_id: categoryId,
        subcategory_id: subcategoryId,
        region_id: regionId || undefined,
        city_id: cityId || undefined,
        district: selectedCity?.name || undefined,
        title: values.title.trim(),
        description: values.description.trim(),
        price: parsedPrice,
        quantity: 1,
        unit: values.unit.trim(),
        delivery_available: values.deliveryAvailable,
        delivery_info: values.deliveryAvailable ? 'Mavjud' : "Mavjud emas",
        media: [],
        files,
      })
      navigate('/profile')
    } catch (submissionError) {
      if (submissionError instanceof ApiError && submissionError.status === 401) {
        try {
          await logout()
        } catch {
          // Session cleared in logout; ignore secondary errors.
        }
        navigate('/login', { replace: true })
        return
      }
      setError(submissionError instanceof Error ? submissionError.message : "E'lon yaratishda xatolik yuz berdi")
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Yangi e&apos;lon yaratish</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">E&apos;lon ma&apos;lumotlarini kiriting</p>
        </div>
        <Link
          to="/profile"
          className="rounded-ui border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          Orqaga
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6"
      >
        <section className="space-y-3">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Joylashuv va toifa</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <select
                {...register('categoryId', { required: 'Kategoriya tanlang' })}
                aria-invalid={Boolean(errors.categoryId)}
                disabled={isLoadingCategories}
                className={getSelectClass(Boolean(errors.categoryId))}
              >
                <option value="">{isLoadingCategories ? 'Yuklanmoqda...' : 'Kategoriya tanlang'}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={SELECT_ICON_CLASS} />
            </div>

            <div className="relative">
              <select
                {...register('subcategoryId', { required: 'Subkategoriya tanlang' })}
                aria-invalid={Boolean(errors.subcategoryId)}
                disabled={!selectedCategoryId || isLoadingSubcategories}
                className={getSelectClass(Boolean(errors.subcategoryId))}
              >
                <option value="">{isLoadingSubcategories ? 'Yuklanmoqda...' : 'Subkategoriya tanlang'}</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={SELECT_ICON_CLASS} />
            </div>

            <div className="relative">
              <select
                {...register('regionId', { required: 'Viloyat tanlang' })}
                value={selectedRegionId ?? ''}
                aria-invalid={Boolean(errors.regionId)}
                disabled={isLoadingRegions}
                className={getSelectClass(Boolean(errors.regionId))}
              >
                <option value="">{isLoadingRegions ? 'Yuklanmoqda...' : 'Viloyat tanlang'}</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={SELECT_ICON_CLASS} />
            </div>

            <div className="relative">
              <select
                {...register('cityId', { required: 'Tuman tanlang' })}
                value={selectedCityId ?? ''}
                aria-invalid={Boolean(errors.cityId)}
                disabled={!selectedRegionId || isLoadingCities}
                className={getSelectClass(Boolean(errors.cityId))}
              >
                <option value="">{isLoadingCities ? 'Yuklanmoqda...' : 'Tuman tanlang'}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={SELECT_ICON_CLASS} />
            </div>
          </div>
          {errors.categoryId || errors.subcategoryId || errors.regionId || errors.cityId ? (
            <p className={ERROR_TEXT_CLASS}>
              {errors.categoryId?.message ||
                errors.subcategoryId?.message ||
                errors.regionId?.message ||
                errors.cityId?.message}
            </p>
          ) : null}
        </section>

        <section className="space-y-3">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Narx va yetkazib berish</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid">
              <input
                {...register('price', {
                  required: 'Narx kiriting',
                  onChange: (event) => {
                    const target = event.target as HTMLInputElement
                    target.value = formatPriceInput(target.value)
                  },
                  validate: (value) => {
                    const parsed = parsePriceInput(value)
                    return (parsed !== undefined && parsed > 0) || "Narx maydoni noto'g'ri"
                  },
                })}
                aria-invalid={Boolean(errors.price)}
                placeholder="Narx"
                className={`col-start-1 row-start-1 w-full rounded-ui border px-3 py-2 text-sm outline-none dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
                  Boolean(errors.price),
                )}`}
              />
              {hasPriceValue ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 self-center pl-3 text-sm text-slate-500 select-none dark:text-slate-400"
                >
                  <span className="invisible whitespace-pre">{priceValue}</span>
                  <span className="whitespace-pre"> so&apos;m</span>
                </span>
              ) : null}
            </div>
            <div ref={unitFieldWrapperRef} className="relative">
              <input
                name={unitRegister.name}
                ref={(element) => {
                  unitRegister.ref(element)
                  unitInputRef.current = element
                }}
                value={unitValue}
                onChange={(event) => {
                  unitRegister.onChange(event)
                  setIsUnitDropdownOpen(true)
                  setUnitHighlightedIndex(unitSuggestions.length > 0 ? 0 : -1)
                }}
                onFocus={() => {
                  setIsUnitDropdownOpen(true)
                  setUnitHighlightedIndex(unitSuggestions.length > 0 ? 0 : -1)
                }}
                onBlur={(event) => {
                  unitRegister.onBlur(event)
                  const nextFocused = event.relatedTarget
                  if (!(nextFocused instanceof HTMLElement) || !unitFieldWrapperRef.current?.contains(nextFocused)) {
                    setIsUnitDropdownOpen(false)
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setIsUnitDropdownOpen(false)
                    return
                  }

                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setIsUnitDropdownOpen(true)
                    setUnitHighlightedIndex((prev) => {
                      if (unitSuggestions.length === 0) return -1
                      if (prev < 0) return 0
                      return Math.min(prev + 1, unitSuggestions.length - 1)
                    })
                    return
                  }

                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    setIsUnitDropdownOpen(true)
                    setUnitHighlightedIndex((prev) => {
                      if (unitSuggestions.length === 0) return -1
                      if (prev < 0) return unitSuggestions.length - 1
                      return Math.max(prev - 1, 0)
                    })
                    return
                  }

                  if (event.key === 'Enter' && isUnitDropdownOpen && unitHighlightedIndex >= 0) {
                    event.preventDefault()
                    const highlightedUnit = unitSuggestions[unitHighlightedIndex]
                    if (highlightedUnit) {
                      selectUnitSuggestion(highlightedUnit)
                    }
                  }
                }}
                aria-invalid={Boolean(errors.unit)}
                placeholder="Birlik tanlang yoki kiriting"
                className={`w-full rounded-ui border px-3 py-2 pr-10 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-daladan-primary/40 dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
                  Boolean(errors.unit),
                )}`}
              />
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setIsUnitDropdownOpen((prev) => !prev)
                  unitInputRef.current?.focus()
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                aria-label="Birlik ro'yxatini ochish"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isUnitDropdownOpen ? (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-ui border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  {unitSuggestions.length > 0 ? (
                    <ul className="max-h-56 overflow-y-auto py-1">
                      {unitSuggestions.map((unit, index) => (
                        <li key={unit}>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectUnitSuggestion(unit)}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                              index === unitHighlightedIndex
                                ? 'bg-daladan-primary/10 text-daladan-primary'
                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                            }`}
                          >
                            {unit}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                      Mos birlik topilmadi, o&apos;zingiz kiriting
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          {errors.price || errors.unit ? (
            <p className={ERROR_TEXT_CLASS}>{errors.price?.message || errors.unit?.message}</p>
          ) : null}

          <div className="rounded-ui border border-slate-200 px-3 py-3 dark:border-slate-600 dark:bg-slate-800">
            <label className="flex cursor-pointer items-center justify-between gap-4 select-none">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {deliveryAvailable ? 'Yetkazib berish mavjud' : "Yetkazib berish yo'q"}
              </span>
              <span className="relative inline-flex shrink-0 items-center">
                <input type="checkbox" {...register('deliveryAvailable')} className="peer sr-only" />
                <span className="h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-daladan-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-daladan-primary dark:bg-slate-600" />
                <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          </div>
        </section>

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
            aria-invalid={Boolean(errors.description)}
            placeholder="Tavsif"
            className={`min-h-28 w-full rounded-ui border px-3 py-2 text-sm outline-none dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
              Boolean(errors.description),
            )}`}
          />
          {errors.title || errors.description ? (
            <p className={ERROR_TEXT_CLASS}>{errors.title?.message || errors.description?.message}</p>
          ) : null}
        </section>

        <section className="space-y-3">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Foto</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Birinchi foto muqova bo&apos;ladi. Bosing, faylni tashlang yoki tartibni surib o&apos;zgartiring.
            </p>
          </div>
          <PhotoUploadGrid slots={photoSlots} onChange={setPhotoSlots} />
          {files.length > 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">Yuklanadigan media: {files.length} ta fayl</p>
          ) : null}
        </section>

        {error ? <p className={ERROR_TEXT_CLASS}>{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || !isValid || isLoadingCategories || isLoadingRegions}
          className="w-full rounded-ui bg-daladan-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Yuborilmoqda...' : "E'lonni joylash"}
        </button>
      </form>
    </div>
  )
}
