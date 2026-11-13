-- Participant profile (language skills and task choice from the registration sheet)
alter table public.abjad_students add column if not exists profile jsonb not null default '{}'::jsonb;

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
    insert into abjad_students(email, full_name, institution, code, tasks, notes, profile)
    values (e, coalesce(trim(r->>'full_name'), ''), coalesce(trim(r->>'institution'), ''),
            abjad_new_code(),
            case when r ? 'tasks' then abjad_clean_tasks(r->'tasks') else array['T0','T1','T2'] end,
            coalesce(r->>'notes', ''),
            case when jsonb_typeof(r->'profile') = 'object' then r->'profile' else '{}'::jsonb end)
    returning * into s;
    added := added || to_jsonb(s);
  end loop;
  return jsonb_build_object('added', added, 'skipped', skipped);
end $$;

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
    notes       = coalesce(p_patch->>'notes', notes),
    profile     = case when jsonb_typeof(p_patch->'profile') = 'object' then p_patch->'profile' else profile end
  where id = p_id returning * into s;
  if s.id is null then raise exception 'not_found'; end if;
  if not s.active then
    delete from abjad_sessions where role = 'student' and subject_id = s.id;
  end if;
  return to_jsonb(s);
end $$;
