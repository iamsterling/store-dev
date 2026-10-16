## What and why

Describe the user/backend outcome and why this is the smallest useful change.

## Verification

- [ ] `pnpm check`
- [ ] `pnpm build`
- [ ] Behavior tested (including invalid inputs and denied access where relevant)
- [ ] No secrets, real customer data, or unrelated files
- [ ] Docs / environment examples / decisions updated as needed

## Database and rollout (if relevant)

- [ ] Named target and authority confirmed before remote changes
- [ ] Migration replay, explicit grants, RLS and tenant-isolation tests
- [ ] Database types regenerated and reviewed
- [ ] Compatibility / backfill / rollback considerations documented

## Remaining gaps

List deliberately deferred work and unverified assumptions.
