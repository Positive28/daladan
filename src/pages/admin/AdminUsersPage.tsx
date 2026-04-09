import { useNavigate } from 'react-router-dom'
import { AdminModal } from '../../components/admin/AdminModal'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminUserFormFields, useAdminUsersPage } from '../../features/admin-users'

export const AdminUsersPage = () => {
  const navigate = useNavigate()
  const {
    rows,
    page,
    setPage,
    perPage,
    lastPage,
    total,
    regions,
    cities,
    loading,
    error,
    forbidden,
    modalOpen,
    saving,
    register,
    handleSubmit,
    regionWatch,
    regionIdRegister,
    openCreate,
    closeModal,
    onSubmit,
    onDelete,
    onPerPageChange,
    setValue,
  } = useAdminUsersPage()

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Foydalanuvchilar</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Ro‘yxatdan o‘tgan foydalanuvchilar</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-daladan-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Yangi foydalanuvchi
          </button>
        </div>

        {forbidden ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            Sizda admin huquqi yo‘q yoki sessiya tugagan.
          </div>
        ) : null}
        {error && !modalOpen ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Ism</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Telefon</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Rol</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Ma&apos;lumot yo‘q
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/users/${row.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/users/${row.id}`)
                      }
                    }}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {[row.fname, row.lname].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.phone}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.role}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(row.id)
                        }}
                        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        O‘chirish
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <AdminPagination
            page={page}
            lastPage={lastPage}
            total={total}
            perPage={perPage}
            disabled={loading}
            onPageChange={setPage}
            onPerPageChange={onPerPageChange}
          />
        </div>
      </div>

      {modalOpen ? (
        <AdminModal
          title="Yangi foydalanuvchi"
          onClose={closeModal}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                form="user-form"
                disabled={saving}
                className="rounded-xl bg-daladan-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          }
        >
          {error && modalOpen ? <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <form id="user-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <AdminUserFormFields
              register={register}
              regionIdRegister={regionIdRegister}
              regionWatch={regionWatch}
              setValue={setValue}
              regions={regions}
              cities={cities}
            />
          </form>
        </AdminModal>
      ) : null}
    </>
  )
}
