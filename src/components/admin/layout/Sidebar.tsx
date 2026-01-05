import { useEffect, useMemo, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Users,
  FileText,
  LibraryBig,
  ChevronDown,
} from 'lucide-react'
import type { UserRole } from '../../../types/admin'

type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: Array<{
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }>
}

const adminNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Posts', href: '/admin/content/posts', icon: FileText },
  { name: 'Books', href: '/admin/books', icon: BookOpen },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Authors', href: '/admin/authors', icon: Users },
  {
    name: 'Content',
    href: '/admin/content',
    icon: FileText,
    subItems: [
      { name: 'Partners', href: '/admin/content/partners', icon: Users },
      { name: 'Services', href: '/admin/content/services', icon: LibraryBig },
      { name: 'Projects', href: '/admin/content/projects', icon: LayoutDashboard },
    ],
  },
]

const authorNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/admin/authors', icon: Users },
  { name: 'Books', href: '/admin/books', icon: BookOpen },
]

const customerNavigation: NavigationItem[] = [
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
]

type SidebarProps = {
  userRole?: UserRole
}

export function Sidebar({ userRole = 'admin' }: SidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const navigation = useMemo(() => {
    if (userRole === 'author') return authorNavigation
    if (userRole === 'customer') return customerNavigation
    return adminNavigation
  }, [userRole])

  useEffect(() => {
    const updated = new Set(expandedItems)

    navigation.forEach((item) => {
      if (item.subItems?.length) {
        const shouldExpand = pathname.startsWith(item.href)
        if (shouldExpand) {
          updated.add(item.name)
        }
      }
    })

    setExpandedItems(updated)
    // only re-run when path changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((current) => {
      const next = new Set(current)
      next.has(itemName) ? next.delete(itemName) : next.add(itemName)
      return next
    })
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className="flex flex-col h-full bg-[#fafafa] text-[#111827] border-r border-gray-200">
      <div className="flex items-center px-6 py-5">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center font-semibold">
            C
          </div>
          <div>
            <p className="text-base font-semibold">Catalogus</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const hasSubItems = item.subItems?.length
          const expanded = expandedItems.has(item.name)

          if (hasSubItems) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-3xl text-sm font-medium text-[#111827] hover:bg-gray-900 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expanded && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const SubIcon = subItem.icon
                      const active = isActive(subItem.href)
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`flex items-center px-3 py-2 rounded-2xl text-sm transition-colors ${
                            active
                              ? 'bg-[#EAEAEA] text-black font-medium'
                              : 'text-[#374151] hover:bg-gray-100'
                          }`}
                        >
                          <SubIcon className="w-4 h-4 mr-3" />
                          {subItem.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const active = isActive(item.href)

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-3 rounded-3xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#EAEAEA] text-black'
                  : 'text-[#111827] hover:bg-gray-900 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
