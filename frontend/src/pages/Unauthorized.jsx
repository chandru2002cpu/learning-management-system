import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { getDashboardPath } from '../utils/auth.js'

function Unauthorized() {
  const { user } = useAuth()
  const dashboardPath = user ? getDashboardPath(user.role) : '/login'

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
        <ShieldX className="h-8 w-8 text-rose-600" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Unauthorized</h1>
      <p className="mt-3 text-slate-600">
        You do not have permission to view this page. Access is based on your account role.
      </p>
      <Link
        to={dashboardPath}
        className="mt-8 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Go to your dashboard
      </Link>
    </section>
  )
}

export default Unauthorized
