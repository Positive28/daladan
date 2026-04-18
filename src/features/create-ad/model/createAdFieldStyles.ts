export const getFieldBorderClass = (hasError: boolean) =>
  hasError
    ? 'border-red-500 dark:border-red-400'
    : 'border-slate-200 dark:border-slate-600'

export const getSelectClass = (hasError: boolean) =>
  `w-full appearance-none rounded-ui border px-3 py-2 pr-10 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-daladan-primary/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
    hasError,
  )}`

export const SELECT_ICON_CLASS =
  'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'

export const ERROR_TEXT_CLASS = 'text-sm font-medium text-red-600 dark:text-red-400'
