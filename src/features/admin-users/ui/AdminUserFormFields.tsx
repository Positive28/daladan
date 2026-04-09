import type { UseFormRegister, UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form'
import type { CityOption, RegionOption } from '../../../services/contracts'
import type { AdminUserFormValues } from '../model/userForm'

export type AdminUserFormFieldsProps = {
  register: UseFormRegister<AdminUserFormValues>
  regionIdRegister: UseFormRegisterReturn<'region_id', AdminUserFormValues>
  regionWatch: string
  setValue: UseFormSetValue<AdminUserFormValues>
  regions: RegionOption[]
  cities: CityOption[]
  /** When true, password field label shows optional-update hint (edit mode). */
  passwordOptional?: boolean
}

export const AdminUserFormFields = ({
  register,
  regionIdRegister,
  regionWatch,
  setValue,
  regions,
  cities,
  passwordOptional,
}: AdminUserFormFieldsProps) => (
  <>
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telefon</label>
      <input
        {...register('phone', { required: true })}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Parol {passwordOptional ? '(yangilash ixtiyoriy)' : ''}
      </label>
      <input
        type="password"
        autoComplete="new-password"
        {...register('password')}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ism</label>
        <input
          {...register('fname')}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Familiya</label>
        <input
          {...register('lname')}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
      <input
        type="email"
        {...register('email')}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telegram</label>
        <input
          {...register('telegram')}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telegram ID</label>
        <input
          {...register('telegram_id')}
          inputMode="numeric"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Viloyat</label>
        <select
          {...regionIdRegister}
          onChange={(e) => {
            regionIdRegister.onChange(e)
            setValue('city_id', '')
          }}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Tanlang</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tuman / shahar</label>
        <select
          {...register('city_id')}
          disabled={!regionWatch}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Tanlang</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
      <select
        {...register('role')}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
    </div>
  </>
)
