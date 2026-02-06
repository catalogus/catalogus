# Auth vs Payment Status

## Plan
- [ ] Clarify goal: auth change vs payment status reliability, and define success criteria.
- [ ] Map current Supabase auth usage and what better-auth would replace.
- [ ] Decide whether to keep Supabase auth and fix M-Pesa status flow, or migrate auth.
- [ ] If migrating, draft migration steps and data model impact.
- [ ] If not migrating, implement automatic status update without manual action.

## Review
- [ ] Decision documented with rationale.
- [ ] If staying on Supabase auth: status updates occur without manual refresh.
- [ ] If migrating: migration path is feasible and scoped.
