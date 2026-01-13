import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthProvider'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { toast } from 'sonner'
import { MoreHorizontal, Search } from 'lucide-react'
import type { UserRole } from '../../types/admin'
import { StatusBadge } from '../../components/admin/ui/StatusBadge'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
})

type AuthorStatus = 'pending' | 'approved' | 'rejected' | null

type UserRow = {
  id: string
  name: string
  email: string | null
  role: UserRole
  status: AuthorStatus
  created_at: string
}

type UserFormValues = {
  name: string
  email: string
  password: string
  role: Exclude<UserRole, null>
  status: AuthorStatus
}

const emptyUserValues: UserFormValues = {
  name: '',
  email: '',
  password: '',
  role: 'author',
  status: 'pending',
}

function AdminUsersPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState<UserFormValues>(emptyUserValues)
  const [filters, setFilters] = useState({
    search: '',
    role: 'all' as 'all' | UserRole,
    status: 'all' as 'all' | Exclude<AuthorStatus, null>,
  })

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, name, email, role, status, created_at')
        .order('created_at', { ascending: false })

      if (filters.role !== 'all') {
        query = query.eq('role', filters.role)
      }

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
        )
      }

      const { data, error } = await query
      if (error) throw error
      return (data as UserRow[]) ?? []
    },
    staleTime: 30_000,
  })

  const adminCountQuery = useQuery({
    queryKey: ['admin', 'users', 'admin-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
      if (error) throw error
      return count ?? 0
    },
    staleTime: 30_000,
  })

  const adminCount = adminCountQuery.data ?? 0

  const createUser = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const email = values.email.toLowerCase().trim()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address')
      }
      if (values.password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: values.password,
        options: {
          data: { name: values.name },
          emailRedirectTo: undefined,
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      const userId = authData.user.id
      const role = values.role
      const status = role === 'author' ? values.status ?? 'pending' : null

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: values.name,
            email,
            role,
            status,
          })
          .eq('id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('profiles').insert({
          id: userId,
          name: values.name,
          email,
          role,
          status,
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'admin-count'] })
      setShowForm(false)
      setFormValues(emptyUserValues)
      toast.success('User created')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to create user'),
  })

  const ensureAuthorRecord = async (profileId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(
        'id, name, bio, photo_url, photo_path, social_links, phone, birth_date, residence_city, province, published_works, author_gallery, featured_video, author_type',
      )
      .eq('id', profileId)
      .maybeSingle()

    if (profileError) throw profileError
    if (!profileData) return

    const { data: existingAuthor, error: existingAuthorError } = await supabase
      .from('authors')
      .select('id')
      .eq('profile_id', profileId)
      .maybeSingle()

    if (existingAuthorError) throw existingAuthorError
    if (existingAuthor) return

    const { error: insertError } = await supabase.from('authors').insert({
      name: profileData.name || 'Autor',
      bio: profileData.bio ?? null,
      photo_url: profileData.photo_url ?? null,
      photo_path: profileData.photo_path ?? null,
      social_links: profileData.social_links ?? {},
      phone: profileData.phone ?? null,
      birth_date: profileData.birth_date ?? null,
      residence_city: profileData.residence_city ?? null,
      province: profileData.province ?? null,
      published_works: profileData.published_works ?? [],
      author_gallery: profileData.author_gallery ?? [],
      featured_video: profileData.featured_video ?? null,
      author_type: profileData.author_type ?? 'Autor Registrado',
      profile_id: profileData.id,
      claim_status: 'approved',
      claimed_at: new Date().toISOString(),
    })

    if (insertError) throw insertError
  }

  const updateUser = useMutation({
    mutationFn: async (payload: { id: string; role: UserRole; status: AuthorStatus }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: payload.role, status: payload.status })
        .eq('id', payload.id)
      if (error) throw error

      if (payload.role === 'author' && payload.status === 'approved') {
        await ensureAuthorRecord(payload.id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'admin-count'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors-for-hero'] })
      toast.success('User updated')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to update user'),
  })

  const roles = useMemo(() => ['admin', 'author', 'customer'] as const, [])
  const statuses = useMemo(() => ['pending', 'approved', 'rejected'] as const, [])

  const handleRoleChange = (user: UserRow, nextRole: UserRole) => {
    if (user.role === 'admin' && nextRole !== 'admin' && adminCount <= 1) {
      toast.error('You cannot remove the last admin')
      return
    }

    const nextStatus: AuthorStatus =
      nextRole === 'author'
        ? user.status ?? 'pending'
        : null

    updateUser.mutate({
      id: user.id,
      role: nextRole,
      status: nextStatus,
    })
  }

  const handleStatusChange = (user: UserRow, nextStatus: AuthorStatus) => {
    if (user.role !== 'author') return
    updateUser.mutate({
      id: user.id,
      role: user.role,
      status: nextStatus,
    })
  }

  return (
    <AdminGuard>
      <DashboardLayout
        userRole={profile?.role ?? 'admin'}
        userName={userName}
        userEmail={userEmail}
        onSignOut={signOut}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase text-gray-500">Community</p>
              <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            </div>
            <Button
              onClick={() => {
                setFormValues(emptyUserValues)
                setShowForm(true)
              }}
            >
              Add user
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4 bg-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  className="pl-9"
                />
              </div>

              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    role: e.target.value as typeof filters.role,
                  }))
                }
                className="w-full sm:w-44 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as typeof filters.status,
                  }))
                }
                className="w-full sm:w-44 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900"
              >
                <option value="all">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {usersQuery.isLoading ? (
              <p className="text-sm text-gray-500 p-4">Loading users...</p>
            ) : usersQuery.isError ? (
              <p className="text-sm text-rose-600 p-4">
                Failed to load users. Check connection or permissions.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQuery.data?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-gray-900">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.email ?? '—'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={user.role ?? 'customer'}
                          variant={
                            user.role === 'admin'
                              ? 'info'
                              : user.role === 'author'
                                ? 'warning'
                                : 'muted'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {user.role === 'author' ? (
                          <StatusBadge
                            label={user.status ?? 'pending'}
                            variant={
                              user.status === 'approved'
                                ? 'success'
                                : user.status === 'rejected'
                                  ? 'danger'
                                  : 'warning'
                            }
                          />
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>Set role</DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup
                                  value={user.role ?? 'customer'}
                                  onValueChange={(value) =>
                                    handleRoleChange(user, value as UserRole)
                                  }
                                >
                                  {roles.map((role) => (
                                    <DropdownMenuRadioItem
                                      key={role}
                                      value={role}
                                      disabled={
                                        user.role === 'admin' &&
                                        adminCount <= 1 &&
                                        role !== 'admin'
                                      }
                                    >
                                      {role}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger
                                disabled={user.role !== 'author'}
                              >
                                Set status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup
                                  value={user.status ?? 'pending'}
                                  onValueChange={(value) =>
                                    handleStatusChange(
                                      user,
                                      value as AuthorStatus,
                                    )
                                  }
                                >
                                  {statuses.map((status) => (
                                    <DropdownMenuRadioItem
                                      key={status}
                                      value={status}
                                    >
                                      {status}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {usersQuery.data?.length === 0 && (
                  <TableCaption>No users found.</TableCaption>
                )}
              </Table>
            )}
          </div>
        </div>

        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent className="w-full sm:max-w-lg px-4">
            <SheetHeader>
              <SheetTitle>New User</SheetTitle>
              <SheetDescription>
                Create an admin, author, or customer account.
              </SheetDescription>
            </SheetHeader>
            <form
              className="space-y-4 pt-4"
              onSubmit={(e) => {
                e.preventDefault()
                createUser.mutate(formValues)
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  required
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  required
                  value={formValues.email}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input
                  type="password"
                  required
                  value={formValues.password}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={formValues.role}
                  onChange={(e) => {
                    const nextRole = e.target.value as UserFormValues['role']
                    setFormValues((prev) => ({
                      ...prev,
                      role: nextRole,
                      status: nextRole === 'author' ? prev.status ?? 'pending' : null,
                    }))
                  }}
                  className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              {formValues.role === 'author' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formValues.status ?? 'pending'}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        status: e.target.value as AuthorStatus,
                      }))
                    }
                    className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </DashboardLayout>
    </AdminGuard>
  )
}
