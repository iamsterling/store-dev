-- One business. Integration receipts are server-only, not a customer API.
create schema integrations;
revoke all on schema integrations from public, anon, authenticated, service_role;

alter default privileges in schema integrations revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema integrations revoke execute on functions from public, anon, authenticated, service_role;
alter default privileges in schema integrations revoke all on sequences from public, anon, authenticated, service_role;

create table integrations.resend_events (
  event_id text primary key check (length(event_id) between 1 and 200),
  email_id uuid not null,
  event_type text not null check (event_type ~ '^email\.[a-z_]{1,80}$'),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  payload_sha256 text not null check (payload_sha256 ~ '^[a-f0-9]{64}$')
);
comment on table integrations.resend_events is
  'Verified Resend email-event receipts. No recipient addresses, bodies, subjects, or raw payloads. Event time is not delivery order.';
create index resend_events_email_history_idx on integrations.resend_events (email_id, occurred_at);
create index resend_events_received_at_idx on integrations.resend_events (received_at);
alter table integrations.resend_events enable row level security;
revoke all on integrations.resend_events from public, anon, authenticated, service_role;
-- Deliberately no customer/staff policies or table grants. Only the narrow RPC writes.

create function public.record_resend_event(
  p_event_id text,
  p_email_id uuid,
  p_event_type text,
  p_occurred_at timestamptz,
  p_payload_sha256 text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_id text;
begin
  -- This RPC is service-only. It does not verify the provider signature: the
  -- Edge Function MUST verify the raw body before calling it.
  insert into integrations.resend_events (event_id, email_id, event_type, occurred_at, payload_sha256)
  values (p_event_id, p_email_id, p_event_type, p_occurred_at, p_payload_sha256)
  on conflict (event_id) do nothing
  returning event_id into inserted_id;

  if inserted_id is not null then
    return true;
  end if;

  -- Never silently accept reuse of an event ID with different signed content.
  if exists (
    select 1 from integrations.resend_events
    where event_id = p_event_id and payload_sha256 = p_payload_sha256
      and email_id = p_email_id and event_type = p_event_type and occurred_at = p_occurred_at
  ) then
    return false;
  end if;
  raise exception 'Event ID content mismatch' using errcode = '23505';
end;
$$;
revoke all on function public.record_resend_event(text, uuid, text, timestamptz, text) from public, anon, authenticated;
grant execute on function public.record_resend_event(text, uuid, text, timestamptz, text) to service_role;
comment on function public.record_resend_event(text, uuid, text, timestamptz, text) is
  'Service-only ingestion bridge to unexposed integrations schema. Returns true for new receipts, false for identical retries. Fixed search_path; no dynamic SQL.';
