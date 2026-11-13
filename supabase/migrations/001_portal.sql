-- Wolofal · AbjadNLP 2027 contributor portal
-- Tables are locked (RLS on, no policies, no grants). The browser reaches the
-- data only through the SECURITY DEFINER functions below, each of which checks
-- a session token. Admin accounts are seeded separately (never commit a password).

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.abjad_admins (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique check (email = lower(email)),
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.abjad_students (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique check (email = lower(email)),
  full_name     text not null default '',
  institution   text not null default '',
  code          text not null unique,
  tasks         text[] not null default array['T0','T1','T2'],
  active        boolean not null default true,
  notes         text not null default '',
  created_at    timestamptz not null default now(),
  last_login_at timestamptz,
  login_count   integer not null default 0
);

create table if not exists public.abjad_sessions (
  token      text primary key,
  role       text not null check (role in ('admin','student')),
  subject_id uuid not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.abjad_failed_logins (
  id         bigserial primary key,
  email      text not null,
  role       text not null,
  at         timestamptz not null default now()
);
create index if not exists abjad_failed_logins_email_at on public.abjad_failed_logins (email, at);

alter table public.abjad_admins        enable row level security;
alter table public.abjad_students      enable row level security;
alter table public.abjad_sessions      enable row level security;
alter table public.abjad_failed_logins enable row level security;
revoke all on public.abjad_admins, public.abjad_students, public.abjad_sessions, public.abjad_failed_logins
  from anon, authenticated;

-- ── helpers (not callable from the browser) ────────────────────────────────
create or replace function public.abjad_new_code()
returns text language plpgsql volatile set search_path = public, extensions as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  b bytea; s text; i int;
begin
  loop
    b := gen_random_bytes(8); s := '';
    for i in 0..7 loop
      s := s || substr(alphabet, (get_byte(b, i) % length(alphabet)) + 1, 1);
      if i = 3 then s := s || '-'; end if;
    end loop;
    s := 'WOL-' || s;
    exit when not exists (select 1 from abjad_students where code = s);
  end loop;
  return s;
end $$;

create or replace function public.abjad_new_session(p_role text, p_subject uuid, p_hours int)
returns text language plpgsql volatile set search_path = public, extensions as $$
declare t text := encode(gen_random_bytes(32), 'hex');
begin
  delete from abjad_sessions where expires_at < now();
  insert into abjad_sessions(token, role, subject_id, expires_at)
  values (t, p_role, p_subject, now() + make_interval(hours => p_hours));
  return t;
end $$;

create or replace function public.abjad_too_many(p_email text, p_role text)
returns boolean language sql stable set search_path = public as $$
  select count(*) >= 8 from abjad_failed_logins
  where email = p_email and role = p_role and at > now() - interval '15 minutes'
$$;

create or replace function public.abjad_require_admin(p_token text)
returns uuid language plpgsql stable set search_path = public as $$
declare a uuid;
begin
  select subject_id into a from abjad_sessions
  where token = p_token and role = 'admin' and expires_at > now();
  if a is null then raise exception 'not_authorized' using errcode = '28000'; end if;
  return a;
end $$;

create or replace function public.abjad_clean_tasks(p jsonb)
returns text[] language sql immutable as $$
  select coalesce(array_agg(distinct v order by v), array[]::text[])
  from jsonb_array_elements_text(coalesce(p, '[]'::jsonb)) v
  where v in ('T0','T1','T2')
$$;

revoke all on function public.abjad_new_code(), public.abjad_new_session(text, uuid, int),
  public.abjad_too_many(text, text), public.abjad_require_admin(text), public.abjad_clean_tasks(jsonb)
  from public, anon, authenticated;

-- ── student API ────────────────────────────────────────────────────────────
create or replace function public.abjad_student_login(p_email text, p_code text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare e text := lower(trim(p_email)); c text := upper(trim(p_code)); s abjad_students;
begin
  if abjad_too_many(e, 'student') then raise exception 'too_many_attempts'; end if;
  select * into s from abjad_students where email = e and code = c and active;
  if s.id is null then
    insert into abjad_failed_logins(email, role) values (e, 'student');
    return jsonb_build_object('ok', false);
  end if;
  update abjad_students set last_login_at = now(), login_count = login_count + 1 where id = s.id;
  return jsonb_build_object('ok', true, 'token', abjad_new_session('student', s.id, 24 * 14),
    'student', jsonb_build_object('email', s.email, 'full_name', s.full_name,
      'institution', s.institution, 'tasks', s.tasks));
end $$;

create or replace function public.abjad_student_me(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  select st.* into s from abjad_sessions se join abjad_students st on st.id = se.subject_id
  where se.token = p_token and se.role = 'student' and se.expires_at > now() and st.active;
  if s.id is null then return null; end if;
  return jsonb_build_object('email', s.email, 'full_name', s.full_name,
    'institution', s.institution, 'tasks', s.tasks);
end $$;

create or replace function public.abjad_logout(p_token text)
returns void language sql security definer set search_path = public as $$
  delete from abjad_sessions where token = p_token
$$;

-- ── admin API ──────────────────────────────────────────────────────────────
create or replace function public.abjad_admin_login(p_email text, p_password text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare e text := lower(trim(p_email)); a abjad_admins;
begin
  if abjad_too_many(e, 'admin') then raise exception 'too_many_attempts'; end if;
  select * into a from abjad_admins where email = e;
  if a.id is null or a.password_hash <> crypt(p_password, a.password_hash) then
    insert into abjad_failed_logins(email, role) values (e, 'admin');
    return jsonb_build_object('ok', false);
  end if;
  return jsonb_build_object('ok', true, 'email', a.email,
    'token', abjad_new_session('admin', a.id, 12));
end $$;

create or replace function public.abjad_admin_me(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a abjad_admins;
begin
  select ad.* into a from abjad_sessions se join abjad_admins ad on ad.id = se.subject_id
  where se.token = p_token and se.role = 'admin' and se.expires_at > now();
  if a.id is null then return null; end if;
  return jsonb_build_object('email', a.email);
end $$;

create or replace function public.abjad_admin_list_students(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform abjad_require_admin(p_token);
  return coalesce((select jsonb_agg(to_jsonb(s) order by s.created_at desc) from abjad_students s), '[]'::jsonb);
end $$;

-- p_rows: [{email, full_name, institution, tasks:[..], notes}]
create or replace function public.abjad_admin_add_students(p_token text, p_rows jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare r jsonb; e text; added jsonb := '[]'::jsonb; skipped jsonb := '[]'::jsonb; s abjad_students;
begin
  perform abjad_require_admin(p_token);
  for r in select * from jsonb_array_elements(p_rows) loop
    e := lower(trim(r->>'email'));
    if e is null or e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
      skipped := skipped || jsonb_build_object('email', coalesce(r->>'email',''), 'reason', 'invalid email');
      continue;
    end if;
    if exists (select 1 from abjad_students where email = e) then
      skipped := skipped || jsonb_build_object('email', e, 'reason', 'already registered');
      continue;
    end if;
    insert into abjad_students(email, full_name, institution, code, tasks, notes)
    values (e, coalesce(trim(r->>'full_name'), ''), coalesce(trim(r->>'institution'), ''),
            abjad_new_code(),
            case when r ? 'tasks' then abjad_clean_tasks(r->'tasks') else array['T0','T1','T2'] end,
            coalesce(r->>'notes', ''))
    returning * into s;
    added := added || to_jsonb(s);
  end loop;
  return jsonb_build_object('added', added, 'skipped', skipped);
end $$;

-- p_patch may hold: full_name, institution, email, tasks, active, notes
create or replace function public.abjad_admin_update_student(p_token text, p_id uuid, p_patch jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  perform abjad_require_admin(p_token);
  update abjad_students set
    full_name   = coalesce(trim(p_patch->>'full_name'), full_name),
    institution = coalesce(trim(p_patch->>'institution'), institution),
    email       = coalesce(lower(trim(p_patch->>'email')), email),
    tasks       = case when p_patch ? 'tasks' then abjad_clean_tasks(p_patch->'tasks') else tasks end,
    active      = coalesce((p_patch->>'active')::boolean, active),
    notes       = coalesce(p_patch->>'notes', notes)
  where id = p_id returning * into s;
  if s.id is null then raise exception 'not_found'; end if;
  if not s.active then
    delete from abjad_sessions where role = 'student' and subject_id = s.id;
  end if;
  return to_jsonb(s);
end $$;

create or replace function public.abjad_admin_regenerate_code(p_token text, p_id uuid)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare s abjad_students;
begin
  perform abjad_require_admin(p_token);
  update abjad_students set code = abjad_new_code() where id = p_id returning * into s;
  if s.id is null then raise exception 'not_found'; end if;
  delete from abjad_sessions where role = 'student' and subject_id = s.id;
  return to_jsonb(s);
end $$;

create or replace function public.abjad_admin_delete_student(p_token text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform abjad_require_admin(p_token);
  delete from abjad_sessions where role = 'student' and subject_id = p_id;
  delete from abjad_students where id = p_id;
end $$;

create or replace function public.abjad_admin_change_password(p_token text, p_old text, p_new text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare aid uuid; a abjad_admins;
begin
  aid := abjad_require_admin(p_token);
  select * into a from abjad_admins where id = aid;
  if a.password_hash <> crypt(p_old, a.password_hash) then
    return jsonb_build_object('ok', false, 'reason', 'Current password is wrong');
  end if;
  if length(p_new) < 10 then
    return jsonb_build_object('ok', false, 'reason', 'New password must have at least 10 characters');
  end if;
  update abjad_admins set password_hash = crypt(p_new, gen_salt('bf', 10)) where id = aid;
  delete from abjad_sessions where role = 'admin' and subject_id = aid and token <> p_token;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function
  public.abjad_student_login(text, text), public.abjad_student_me(text), public.abjad_logout(text),
  public.abjad_admin_login(text, text), public.abjad_admin_me(text),
  public.abjad_admin_list_students(text), public.abjad_admin_add_students(text, jsonb),
  public.abjad_admin_update_student(text, uuid, jsonb), public.abjad_admin_regenerate_code(text, uuid),
  public.abjad_admin_delete_student(text, uuid), public.abjad_admin_change_password(text, text, text)
  from public;
grant execute on function
  public.abjad_student_login(text, text), public.abjad_student_me(text), public.abjad_logout(text),
  public.abjad_admin_login(text, text), public.abjad_admin_me(text),
  public.abjad_admin_list_students(text), public.abjad_admin_add_students(text, jsonb),
  public.abjad_admin_update_student(text, uuid, jsonb), public.abjad_admin_regenerate_code(text, uuid),
  public.abjad_admin_delete_student(text, uuid), public.abjad_admin_change_password(text, text, text)
  to anon, authenticated;
