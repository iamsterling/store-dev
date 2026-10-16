-- Run with psql -X -v ON_ERROR_STOP=1 -f tests/resend-event-receipts.sql
-- All synthetic rows and role changes are rolled back, including on test failure.
begin;

do $$
declare
  signature regprocedure := 'public.record_resend_event(text,uuid,text,timestamptz,text)'::regprocedure;
begin
  if has_schema_privilege('anon', 'integrations', 'usage')
    or has_schema_privilege('authenticated', 'integrations', 'usage')
    or has_schema_privilege('service_role', 'integrations', 'usage') then
    raise exception 'Private schema leaked';
  end if;
  if has_function_privilege('anon', signature, 'execute')
    or has_function_privilege('authenticated', signature, 'execute')
    or not has_function_privilege('service_role', signature, 'execute') then
    raise exception 'RPC grants incorrect';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'integrations.resend_events'::regclass) then
    raise exception 'RLS missing';
  end if;
end;
$$;

set local role service_role;
do $$
declare
  email uuid := '11111111-1111-4111-8111-111111111111';
  event_time timestamptz := '2026-10-15T12:00:00Z';
begin
  if public.record_resend_event('test_resend_receipt_1', email, 'email.delivered', event_time, repeat('a',64)) is distinct from true then
    raise exception 'First event not accepted';
  end if;
  if public.record_resend_event('test_resend_receipt_1', email, 'email.delivered', event_time, repeat('a',64)) is distinct from false then
    raise exception 'Retry not deduplicated';
  end if;
  -- Earlier event arriving later must remain in history, not overwrite delivery.
  perform public.record_resend_event('test_resend_receipt_2', email, 'email.sent', event_time - interval '1 minute', repeat('b',64));
  begin
    perform public.record_resend_event('test_resend_receipt_1', email, 'email.bounced', event_time, repeat('c',64));
    raise exception 'Conflicting duplicate accepted';
  exception when unique_violation then null;
  end;
  begin
    perform public.record_resend_event('test_resend_invalid', email, 'invalid', event_time, repeat('d',64));
    raise exception 'Invalid type accepted';
  exception when check_violation then null;
  end;
  begin
    perform public.record_resend_event('test_resend_invalid', email, 'email.sent', event_time, 'bad-digest');
    raise exception 'Invalid digest accepted';
  exception when check_violation then null;
  end;
  begin
    perform 1 from integrations.resend_events;
    raise exception 'Service role can read private table directly';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

set local role anon;
do $$
begin
  begin
    perform public.record_resend_event('test_anon', '11111111-1111-4111-8111-111111111111', 'email.sent', now(), repeat('a',64));
    raise exception 'Anon can ingest';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from integrations.resend_events;
    raise exception 'Anon can read';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

set local role authenticated;
do $$
begin
  begin
    perform public.record_resend_event('test_customer', '11111111-1111-4111-8111-111111111111', 'email.sent', now(), repeat('a',64));
    raise exception 'Customer can ingest';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from integrations.resend_events;
    raise exception 'Customer can read';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

do $$
begin
  if (select count(*) from integrations.resend_events where event_id in ('test_resend_receipt_1','test_resend_receipt_2')) <> 2 then
    raise exception 'Unexpected persisted receipt count';
  end if;
end;
$$;
rollback;
select 'PASS: receipt insertion, duplicate/conflict handling, validation, RLS and role isolation (rolled back)' as result;
