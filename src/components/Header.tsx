import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center font-semibold">
            C
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Catalogus</p>
            <p className="text-xs text-gray-500">Livraria online</p>
          </div>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            to="/auth/sign-in"
            className="px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900"
          >
            Entrar
          </Link>
          <Link
            to="/admin/dashboard"
            className="px-3 py-2 rounded-lg bg-black text-white hover:bg-gray-900"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
}
