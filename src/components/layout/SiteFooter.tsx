export const SiteFooter = () => {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 lg:grid-cols-3 lg:px-6">
        <div>
          <img src="/daladan-logo-full.png" alt="Daladan" className="h-10 object-contain" />
          <p className="mt-2">
            Mahsulotlarni ishlab chiqaruvchidan iste&apos;molchiga yetkazib beruvchi marketplace.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Yordam</p>
          <p className="mt-2">Qanday sotish kerak?</p>
          <p>Xavfsizlik qoidalari</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Bog&apos;lanish</p>
          <p className="mt-2">
            <a href="tel:+998936567890" className="font-medium text-blue-600 hover:underline">
              +998 93 656 78 90
            </a>
          </p>
        </div>
      </div>
      <p className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Dasturchi:{' '}
        <a
          href="https://softwhere.uz"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 hover:underline"
        >
          softwhere.uz
        </a>{' '}
        © 2026
      </p>
    </footer>
  )
}
