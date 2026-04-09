type AdminPaginationProps = {
  page: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  disabled?: boolean
}

const PER_OPTIONS = [10, 15, 25, 50]

export const AdminPagination = ({
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
  disabled,
}: AdminPaginationProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Jami <span className="font-medium text-slate-800 dark:text-slate-200">{total}</span> ta
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          Sahifada
          <select
            value={perPage}
            disabled={disabled}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {PER_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:enabled:hover:bg-slate-800"
          >
            Oldingi
          </button>
          <span className="px-2 text-sm text-slate-600 dark:text-slate-400">
            {page} / {lastPage}
          </span>
          <button
            type="button"
            disabled={disabled || page >= lastPage}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:enabled:hover:bg-slate-800"
          >
            Keyingi
          </button>
        </div>
      </div>
    </div>
  )
}
