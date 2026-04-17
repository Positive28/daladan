import { profileAdCopy } from '../../profile-ad/model/copy'

/** User-facing copy for promotion list flows (single source to avoid drift). */
export const adPromotionMessages = {
  ...profileAdCopy,
  invalidUserId: 'Noto‘g‘ri foydalanuvchi identifikatori.',
  adminWrongSeller: 'E‘lon boshqa foydalanuvchiga tegishli.',
  adminAdNotFound: 'E‘lon topilmadi.',
  adminLoadFailed: "Ma'lumotlarni yuklashda xatolik",
  promoListFailed: 'Reklama ro‘yxatini yuklashda xatolik',
} as const
