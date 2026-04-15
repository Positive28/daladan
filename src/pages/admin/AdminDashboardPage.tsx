import { Link } from 'react-router-dom'
import { Tags, Users } from 'lucide-react'

const cards = [
  {
    to: '/categories',
    title: 'Kategoriyalar',
    description: "Bo'zor kategoriyalarini boshqarish",
    icon: Tags,
  },
  {
    to: '/subcategories',
    title: 'Subkategoriyalar',
    description: 'Kategoriyaga bog‘langan subkategoriyalar',
    icon: Tags,
  },
  {
    to: '/users',
    title: 'Foydalanuvchilar',
    description: 'Ro‘yxatdan o‘tgan foydalanuvchilar',
    icon: Users,
  },
]

export const AdminDashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Boshqaruv paneli</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Kategoriyalar, subkategoriyalar va foydalanuvchilarni shu yerdan boshqaring.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ to, title, description, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex h-full flex-col rounded-ui border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <Icon className="mb-3 text-daladan-primary" size={28} aria-hidden />
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</span>
              <span className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
