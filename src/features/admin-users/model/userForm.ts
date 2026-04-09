import type { AdminUserCreatePayload, AdminUserListItem, AdminUserUpdatePayload } from '../../../types/admin'

export type AdminUserFormValues = {
  phone: string
  password: string
  fname: string
  lname: string
  email: string
  telegram: string
  telegram_id: string
  region_id: string
  city_id: string
  role: 'user' | 'admin'
}

export const emptyUserForm: AdminUserFormValues = {
  phone: '',
  password: '',
  fname: '',
  lname: '',
  email: '',
  telegram: '',
  telegram_id: '',
  region_id: '',
  city_id: '',
  role: 'user',
}

export const toCreatePayload = (v: AdminUserFormValues): AdminUserCreatePayload => ({
  phone: v.phone.trim(),
  password: v.password,
  fname: v.fname.trim() || undefined,
  lname: v.lname.trim() || undefined,
  email: v.email.trim() || undefined,
  telegram: v.telegram.trim() || undefined,
  telegram_id: v.telegram_id.trim() ? Number(v.telegram_id) : undefined,
  region_id: v.region_id ? Number(v.region_id) : undefined,
  city_id: v.city_id ? Number(v.city_id) : undefined,
  role: v.role,
})

export const toUpdatePayload = (v: AdminUserFormValues): AdminUserUpdatePayload => {
  const payload: AdminUserUpdatePayload = {
    phone: v.phone.trim() || undefined,
    fname: v.fname.trim() || undefined,
    lname: v.lname.trim() || undefined,
    email: v.email.trim() || undefined,
    telegram: v.telegram.trim() || undefined,
    telegram_id: v.telegram_id.trim() ? Number(v.telegram_id) : undefined,
    region_id: v.region_id ? Number(v.region_id) : undefined,
    city_id: v.city_id ? Number(v.city_id) : undefined,
    role: v.role,
  }
  if (v.password.trim()) payload.password = v.password.trim()
  return payload
}

export const userToForm = (u: AdminUserListItem): AdminUserFormValues => ({
  phone: u.phone,
  password: '',
  fname: u.fname ?? '',
  lname: u.lname ?? '',
  email: u.email ?? '',
  telegram: u.telegram ?? '',
  telegram_id: u.telegram_id != null && !Number.isNaN(u.telegram_id) ? String(u.telegram_id) : '',
  region_id: u.region_id ? String(u.region_id) : '',
  city_id: u.city_id ? String(u.city_id) : '',
  role: u.role === 'admin' ? 'admin' : 'user',
})
