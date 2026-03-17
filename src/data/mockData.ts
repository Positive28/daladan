import type { BoostPlan, Listing, Profile } from '../types/marketplace'

export const listings: Listing[] = [
  {
    id: 'apple-1',
    title: "Sarhil qizil olmalar",
    category: "Qishloq xo'jaligi",
    categoryPath: ["Qishloq xo'jaligi", 'Mevalar'],
    kind: 'item',
    location: 'Toshkent viloyati, Parkent',
    price: 15000,
    unit: "so'm / kg",
    isTopSale: true,
    isFresh: true,
    phone: '+998 90 111 22 33',
    description:
      "Bog'imizdan yangi uzilgan, shirin va sershira qizil olmalar. Har bir olma qo'lda saralangan.",
    image:
      'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tomato-2',
    title: 'Issiqxona pomidorlari',
    category: 'Sabzavotlar',
    categoryPath: ["Qishloq xo'jaligi", 'Sabzavotlar'],
    kind: 'item',
    location: 'Samarqand, Urgut',
    price: 12000,
    unit: "so'm / kg",
    isBoosted: true,
    phone: '+998 90 444 11 55',
    description:
      "Organik usulda yetishtirilgan pomidorlar. Restoran va do'konlar uchun ulgurji narx mavjud.",
    image:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tractor-service-3',
    title: 'Traktor bilan yer haydash xizmati',
    category: 'Xizmatlar',
    categoryPath: ['Xizmatlar', 'Texnika xizmati'],
    kind: 'service',
    location: 'Jizzax shahri',
    price: 180000,
    unit: "so'm / soat",
    phone: '+998 91 222 99 77',
    description:
      "Katta va kichik maydonlar uchun professional haydash xizmati. Tezkor chiqish va sifat kafolati.",
    image:
      'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'honey-4',
    title: 'Tabiiy tog‘ asali',
    category: 'Oziq-ovqat',
    categoryPath: ["Qishloq xo'jaligi", "Asal va mahsulotlar"],
    kind: 'item',
    location: 'Namangan, Chortoq',
    price: 85000,
    unit: "so'm / kg",
    isBoosted: true,
    phone: '+998 93 123 45 67',
    description:
      "100% tabiiy asal. Qadoqlangan va yetkazib berish imkoniyati bor.",
    image:
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
  },
]

export const profile: Profile = {
  fullName: 'Abdulloh Karimov',
  phone: '+998 90 123 45 67',
  region: 'Toshkent shahri',
  bio: "Meva-sabzavot yetishtirish bilan 10 yildan beri shug'ullanaman.",
}

export const boostPlans: BoostPlan[] = [
  {
    id: 'top-sale',
    name: 'Top Sotuv',
    price: 45000,
    description:
      "E'loningiz ro'yxatning yuqorisida ko'rinadi. Sotuv ehtimoli sezilarli oshadi.",
    badge: 'Tavsiya etiladi',
  },
  {
    id: 'boosted',
    name: 'Boosted',
    price: 25000,
    description:
      "Qidiruv natijalarida ko'rinish sonini oshiradi va ko'proq xaridor jalb qiladi.",
  },
]
