import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../services/apiClient'
import { aiService, authService, marketplaceService, profileService } from '../../../services'
import type { CityOption, RegionOption } from '../../../services/contracts'
import { PROFILE_AD_UNIT_OPTIONS } from '../../../services/profileAdPayloadBuilders'
import { useAuth } from '../../../state/AuthContext'
import type { CategoryOption, SubcategoryOption } from '../../../types/marketplace'
import { LOGIN_PATH } from '../../../utils/appPaths'
import { parsePriceInput } from '../../../utils/price'
import { createEmptyPhotoSlots } from './createAdConstants'
import type { CreateAdFormValues } from './createAdForm.types'

export function useCreateAdPage() {
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
    if (!query) return [...PROFILE_AD_UNIT_OPTIONS]
    return PROFILE_AD_UNIT_OPTIONS.filter((unit) => unit.toLowerCase().includes(query))
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

    const deliveryAvailableValue = getValues('deliveryAvailable')
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
        deliveryAvailable: deliveryAvailableValue,
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
  }, [
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
  ])

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
        navigate(LOGIN_PATH, { replace: true })
        return
      }
      setError(submissionError instanceof Error ? submissionError.message : "E'lon yaratishda xatolik yuz berdi")
    }
  }

  return {
    register,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    categories,
    subcategories,
    regions,
    cities,
    isLoadingCategories,
    isLoadingSubcategories,
    isLoadingRegions,
    isLoadingCities,
    selectedCategoryId,
    selectedSubcategoryId,
    selectedRegionId,
    selectedCityId,
    priceValue,
    unitValue,
    deliveryAvailable,
    hasPriceValue,
    files,
    photoSlots,
    setPhotoSlots,
    error,
    isGeneratingDescription,
    isGenerateDescriptionDisabled,
    unitRegister,
    unitSuggestions,
    isUnitDropdownOpen,
    setIsUnitDropdownOpen,
    unitHighlightedIndex,
    setUnitHighlightedIndex,
    unitFieldWrapperRef,
    unitInputRef,
    selectUnitSuggestion,
    handleGenerateDescription,
    onSubmit,
  }
}
