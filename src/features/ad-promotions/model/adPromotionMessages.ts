import { profileAdCopy } from '../../profile-ad/model/copy'

/** User-facing copy for promotion list flows (single source to avoid drift). */
export const adPromotionMessages = {
  ...profileAdCopy,
  invalidUserId: 'Noto‘g‘ri foydalanuvchi identifikatori.',
  adminWrongSeller: 'E‘lon boshqa foydalanuvchiga tegishli.',
  adminAdNotFound: 'E‘lon topilmadi.',
  adminLoadFailed: "Ma'lumotlarni yuklashda xatolik",
  promoListFailed: 'Reklama ro‘yxatini yuklashda xatolik',
  promoHistoryUnavailable:
    'Reklama tarixini serverdan yuklab bo‘lmadi. Tariflar va boshqa bo‘limlar ishlaydi.',
  confirmPromoTitle: 'To‘lovni tasdiqlash',
  confirmPromoHint:
    'Click yoki Payme tranzaksiya ID sini kiriting (ixtiyoriy). Tasdiqlashdan keyin promo faollashadi.',
  confirmPromoFailed: 'Tasdiqlashda xatolik',
  confirmPromoSubmit: 'Tasdiqlash',
} as const
