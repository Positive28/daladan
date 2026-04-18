export const PHOTO_UPLOAD_SLOT_COUNT = 8

export const createEmptyPhotoSlots = () =>
  Array.from({ length: PHOTO_UPLOAD_SLOT_COUNT }, () => null as File | null)
