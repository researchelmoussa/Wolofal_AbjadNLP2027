-- Students added after the first allocation had no T0 share (0 / 0), so T0 could never be
-- completed and T1/T2 stayed locked. Now a student with T0 and no share gets one, the same size
-- as the others' average, drawn from texts not yet in the sample (keeping the group mix), the
-- first time they open their tasks. The other students' shares are not touched.

create or replace function public.abjad_t0_ensure_share(p_student uuid)
returns int language plpgsql volatile set search_path = public as $$
declare n int; share int; got int := 0; g record; k int; base_rank int;
begin
  if not exists (select 1 from abjad_students where id = p_student and active and 'T0' = any(tasks)) then return 0; end if;
  if exists (select 1 from abjad_t0_texts where in_sample and assigned_to = p_student) then return 0; end if;
  -- one allocation at a time
  perform pg_advisory_xact_lock(2027000);
  if exists (select 1 from abjad_t0_texts where in_sample and assigned_to = p_student) then return 0; end if;
  select round(avg(c))::int into share from (
    select count(*) c from abjad_t0_texts x join abjad_students s on s.id = x.assigned_to
    where x.in_sample and s.active group by x.assigned_to) z;
  share := coalesce(share, 272);
  select coalesce(max(sample_rank), 0) into base_rank from abjad_t0_texts;
  -- per group, in proportion to the group's size among the texts still outside the sample
  for g in select grp, count(*) c, sum(count(*)) over () total from abjad_t0_texts where not in_sample group by grp loop
    k := round(share * g.c::numeric / g.total);
    update abjad_t0_texts x set in_sample = true, assigned_to = p_student, sample_rank = base_rank + got + p.rn
    from (select id, row_number() over (order by md5(id::text || '-2027'))::int rn
          from abjad_t0_texts where not in_sample and grp = g.grp
          order by md5(id::text || '-2027') limit k) p
    where x.id = p.id;
    get diagnostics n = row_count; got := got + n;
  end loop;
  return got;
end $$;
revoke all on function public.abjad_t0_ensure_share(uuid) from public, anon, authenticated;

-- called when the student opens their tasks or the T0 page
create or replace function public.abjad_student_tasks(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; au abjad_t1_authors; unl boolean;
begin
  s := abjad_require_student(p_token);
  perform abjad_t0_ensure_share(s.id);
  unl := abjad_t12_unlocked(s.id);
  if unl and s.ann_id is null then
    begin perform abjad_t12_ready(s.id); exception when others then null; end;
    select * into s from abjad_students where id = s.id;
  end if;
  select * into au from abjad_t1_authors where ann_id = s.ann_id;
  return jsonb_build_object(
    'ann_id', s.ann_id, 'tasks', s.tasks, 'task_status', s.task_status, 'unlocked', unl,
    'full_name', s.full_name, 'email', s.email,
    'T0', abjad_progress(s.id, 'T0'),
    'T1', abjad_progress(s.id, 'T1') || jsonb_build_object('author_name', au.author_name, 'author_id', au.author_id),
    'T2', abjad_progress(s.id, 'T2'));
end $$;
