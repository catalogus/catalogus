import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../components/admin/layout'
import { withAdminGuard } from '../../components/admin/withAdminGuard'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthProvider'
import { Button } from '../../components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { AuthorRow, ClaimStatus } from '../../types/author'

export const Route = createFileRoute('/admin/author-claims')({
  component: withAdminGuard(AdminAuthorClaimsPage),
})

type ClaimRow = AuthorRow & {
  profile: {
    id: string
    name: string
    email: string
    status: string
  } | null
  verification_notes?: string | null
}

function AdminAuthorClaimsPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<ClaimStatus | 'all'>('pending')
  const authKey = session?.user.id ?? 'anon'
  const canQuery = !!session?.access_token

  const claimsQuery = useQuery({
    queryKey: ['admin', 'author-claims', authKey, filter],
    queryFn: async () => {
      let query = supabase
        .from('authors')
        .select(`
          id, name, bio, photo_url, photo_path, claim_status, claimed_at, wp_slug, profile_id,
          profile:profiles!authors_profile_id_fkey(id, name, email, status)
        `)
        .not('claim_status', 'eq', 'unclaimed')
        .order('claimed_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('claim_status', filter)
      }

      const { data: authorsData, error } = await query
      if (error) throw error

      // For each author with a claim, fetch verification notes from author_claims
      const claimsWithNotes = await Promise.all(
        (authorsData ?? []).map(async (author: any) => {
          if (author.profile_id && (author.claim_status === 'pending' || author.claim_status === 'rejected')) {
            const { data: claimData } = await supabase
              .from('author_claims')
              .select('notes')
              .eq('author_id', author.id)
              .eq('profile_id', author.profile_id)
              .eq('status', author.claim_status)
              .maybeSingle()

            return {
              ...author,
              verification_notes: claimData?.notes || null,
            }
          }
          return author
        })
      )

      return (claimsWithNotes as ClaimRow[]) ?? []
    },
    staleTime: 30_000,
    enabled: canQuery,
  })

  const approveClaim = useMutation({
    mutationFn: async (payload: { authorId: string; profileId: string }) => {
      const adminId = session?.user?.id

      const { error } = await supabase
        .from('authors')
        .update({
          claim_status: 'approved',
          claim_reviewed_at: new Date().toISOString(),
          claim_reviewed_by: adminId,
        })
        .eq('id', payload.authorId)

      if (error) throw error

      // Also approve profile if pending
      await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', payload.profileId)
        .eq('status', 'pending')

      // Update audit table
      await supabase
        .from('author_claims')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
        })
        .eq('author_id', payload.authorId)
        .eq('profile_id', payload.profileId)
        .eq('status', 'pending')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'author-claims'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      toast.success('Claim approved successfully')
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Failed to approve claim')
    },
  })

  const rejectClaim = useMutation({
    mutationFn: async (payload: { authorId: string; profileId: string }) => {
      const adminId = session?.user?.id

      const { error } = await supabase
        .from('authors')
        .update({
          claim_status: 'rejected',
          claim_reviewed_at: new Date().toISOString(),
          claim_reviewed_by: adminId,
        })
        .eq('id', payload.authorId)

      if (error) throw error

      // Update audit table
      await supabase
        .from('author_claims')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
        })
        .eq('author_id', payload.authorId)
        .eq('profile_id', payload.profileId)
        .eq('status', 'pending')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'author-claims'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      toast.success('Claim rejected')
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Failed to reject claim')
    },
  })

  const getStatusBadgeColor = (status: ClaimStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'approved':
        return 'bg-emerald-100 text-emerald-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Author Claims</h1>
            <p className="text-gray-600 mt-1">Review and manage author profile claims</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 border-b border-gray-200">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab !== 'all' && claimsQuery.data && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {claimsQuery.data.filter((c) => c.claim_status === tab).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            {claimsQuery.isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading claims...</div>
            ) : claimsQuery.error ? (
              <div className="p-8 text-center text-red-600">
                Error loading claims. Please try again.
              </div>
            ) : claimsQuery.data?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {filter !== 'all' ? filter : ''} claims found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author Name</TableHead>
                    <TableHead>Claimed By</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Verification Info</TableHead>
                    <TableHead>Profile Status</TableHead>
                    <TableHead>Claimed Date</TableHead>
                    <TableHead>Claim Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claimsQuery.data?.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {claim.photo_url && (
                            <img
                              src={claim.photo_url}
                              alt={claim.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{claim.name}</div>
                            <Link
                              to={`/autor/${claim.wp_slug || claim.id}`}
                              className="text-xs text-blue-600 hover:underline"
                              target="_blank"
                            >
                              View public page
                            </Link>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{claim.profile?.name ?? '-'}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {claim.profile?.email ?? '-'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {claim.verification_notes ? (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                              Ver detalhes
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded text-gray-700 whitespace-pre-wrap text-xs">
                              {claim.verification_notes}
                            </div>
                          </details>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {claim.profile?.status && (
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                              claim.profile.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : claim.profile.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {claim.profile.status}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {claim.claimed_at
                          ? new Date(claim.claimed_at).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(claim.claim_status!)}`}
                        >
                          {claim.claim_status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {claim.claim_status === 'pending' && claim.profile && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                rejectClaim.mutate({
                                  authorId: claim.id,
                                  profileId: claim.profile!.id,
                                })
                              }
                              disabled={rejectClaim.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                approveClaim.mutate({
                                  authorId: claim.id,
                                  profileId: claim.profile!.id,
                                })
                              }
                              disabled={approveClaim.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        )}
                        {claim.claim_status !== 'pending' && (
                          <span className="text-sm text-gray-400">No actions</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
      </div>
    </DashboardLayout>
  )
}
