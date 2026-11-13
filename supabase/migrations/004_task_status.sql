-- Per-participant progress on T0 / T1 / T2: incomplete | ongoing | completed
alter table public.abjad_students add column if not exists task_status jsonb not null
  default '{"T0":"incomplete","T1":"incomplete","T2":"incomplete"}'::jsonb;

create or replace function public.abjad_admin_set_task_status(p_token text, p_id uuid, p_task text, p_status text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  perform abjad_require_admin(p_token);
  if p_task not in ('T0','T1','T2') or p_status not in ('incomplete','ongoing','completed') then
    raise exception 'invalid_status';
  end if;
  update abjad_students set task_status = task_status || jsonb_build_object(p_task, p_status)
  where id = p_id returning * into s;
  if s.id is null then raise exception 'not_found'; end if;
  return to_jsonb(s);
end $$;
revoke all on function public.abjad_admin_set_task_status(text, uuid, text, text) from public;
grant execute on function public.abjad_admin_set_task_status(text, uuid, text, text) to anon, authenticated;

-- students see their own progress
create or replace function public.abjad_student_me(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  select st.* into s from abjad_sessions se join abjad_students st on st.id = se.subject_id
  where se.token = p_token and se.role = 'student' and se.expires_at > now() and st.active;
  if s.id is null then return null; end if;
  return jsonb_build_object('email', s.email, 'full_name', s.full_name,
    'institution', s.institution, 'tasks', s.tasks, 'task_status', s.task_status);
end $$;
