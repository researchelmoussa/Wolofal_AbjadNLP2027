-- T1 and T2 unlock together, automatically, once the student has completed T0.
-- At that moment the student gets the first free annotator id (ANN_01 … ANN_08) if the
-- admin has not set one; the admin can still change it on the Allocation page.

-- unlocked = T0 not assigned to the student, or T0 completed
create or replace function public.abjad_t12_unlocked(p_student uuid)
returns boolean language sql stable set search_path = public as $$
  select not ('T0' = any(tasks)) or task_status->>'T0' = 'completed'
  from abjad_students where id = p_student
$$;

-- returns the student's annotator id, assigning the first free one on unlock; raises 'locked' before
create or replace function public.abjad_t12_ready(p_student uuid)
returns text language plpgsql volatile set search_path = public as $$
declare a text;
begin
  if not abjad_t12_unlocked(p_student) then raise exception 'locked'; end if;
  select ann_id into a from abjad_students where id = p_student;
  if a is null then
    select x.ann_id into a from (
      select ann_id from abjad_t1_authors union select ann_id from abjad_t2_assign) x
    where not exists (select 1 from abjad_students s where s.ann_id = x.ann_id)
    order by x.ann_id limit 1;
    if a is null then raise exception 'no_free_ann'; end if;
    update abjad_students set ann_id = a where id = p_student;
  end if;
  return a;
end $$;

create or replace function public.abjad_student_tasks(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; au abjad_t1_authors; unl boolean;
begin
  s := abjad_require_student(p_token);
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

-- T1 / T2 functions refuse until unlocked (and make sure the annotator id exists)
create or replace function public.abjad_t1_list(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; au abjad_t1_authors; a text;
begin
  s := abjad_require_student(p_token);
  a := abjad_t12_ready(s.id);
  select * into au from abjad_t1_authors where ann_id = a;
  return jsonb_build_object('ann_id', a, 'author', to_jsonb(au),
    'passages', coalesce((select jsonb_agg(to_jsonb(p) - 'text_hash' - 'student_id' order by p.created_at desc)
                          from abjad_t1_passages p where p.ann_id = a), '[]'::jsonb));
end $$;

create or replace function public.abjad_t2_list(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; a text;
begin
  s := abjad_require_student(p_token);
  a := abjad_t12_ready(s.id);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'unit_id', u.unit_id,
      'common', g.scope = 'all',
      'ajami', u.data->>'annotator_corrected_wolofal_ajami',
      'sentiment', u.data->>'original_sentiment',
      'gloss_fr', u.data->>'french_helper_gloss',
      'msa', u.data->>'source_msa',
      'latin', u.data->>'draft_wolof_latin',
      'answer', case when x.unit_id is null then null else
        jsonb_build_object('confirmed', x.confirmed, 'sentiment', x.sentiment, 'reason', x.reason) end
    ) order by g.position)
    from abjad_t2_assign g join abjad_t2_units u on u.unit_id = g.unit_id
    left join abjad_t2_answers x on x.unit_id = g.unit_id and x.ann_id = g.ann_id
    where g.ann_id = a), '[]'::jsonb);
end $$;

-- guard the write paths too (keeps the existing bodies, adds the unlock check first)
create or replace function public.abjad_t1_guard(p_token text)
returns void language plpgsql volatile set search_path = public as $$
declare s abjad_students;
begin
  s := abjad_require_student(p_token);
  perform abjad_t12_ready(s.id);
end $$;


create or replace function public.abjad_t1_save(p_token text, p_id bigint, p_row jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare s abjad_students; au abjad_t1_authors; txt text; wc int; h text; r abjad_t1_passages;
begin
  perform abjad_t1_guard(p_token);
  s := abjad_require_student(p_token);
  select * into au from abjad_t1_authors where ann_id = s.ann_id;
  if au.ann_id is null then raise exception 'no_author'; end if;
  txt := btrim(regexp_replace(coalesce(p_row->>'wolofal_passage',''), '[ \t]+', ' ', 'g'));
  wc := abjad_word_count(txt);
  if wc < 50 or wc > 150 then raise exception 'word_count'; end if;
  h := encode(digest(regexp_replace(txt, '\s+', '', 'g'), 'sha256'), 'hex');
  if exists (select 1 from abjad_t1_passages where text_hash = h and id is distinct from p_id) then
    raise exception 'duplicate_passage';
  end if;
  if p_id is null then
    insert into abjad_t1_passages(ann_id, student_id, author_id, author_name, work_title, doc_id, genre, period,
      word_count, self_mention_removed, wolofal_passage, wolof_latin_optional, notes, source_collection, reference, method, text_hash)
    values (s.ann_id, s.id, au.author_id, au.author_name,
      left(coalesce(p_row->>'work_title',''), 300), coalesce(nullif(btrim(p_row->>'doc_id'),''), 'DOC01'),
      left(coalesce(p_row->>'genre',''), 60), left(coalesce(p_row->>'period',''), 60), wc,
      case when p_row->>'self_mention_removed' = 'Yes' then 'Yes' else 'No' end, txt,
      left(coalesce(p_row->>'wolof_latin_optional',''), 5000), left(coalesce(p_row->>'notes',''), 1000),
      left(coalesce(p_row->>'source_collection',''), 200), left(coalesce(p_row->>'reference',''), 500),
      left(coalesce(p_row->>'method',''), 60), h)
    returning * into r;
  else
    update abjad_t1_passages set
      work_title = left(coalesce(p_row->>'work_title',''), 300), doc_id = coalesce(nullif(btrim(p_row->>'doc_id'),''), 'DOC01'),
      genre = left(coalesce(p_row->>'genre',''), 60), period = left(coalesce(p_row->>'period',''), 60), word_count = wc,
      self_mention_removed = case when p_row->>'self_mention_removed' = 'Yes' then 'Yes' else 'No' end,
      wolofal_passage = txt, wolof_latin_optional = left(coalesce(p_row->>'wolof_latin_optional',''), 5000),
      notes = left(coalesce(p_row->>'notes',''), 1000), source_collection = left(coalesce(p_row->>'source_collection',''), 200),
      reference = left(coalesce(p_row->>'reference',''), 500), method = left(coalesce(p_row->>'method',''), 60),
      text_hash = h, updated_at = now()
    where id = p_id and ann_id = s.ann_id returning * into r;
    if r.id is null then raise exception 'not_found'; end if;
  end if;
  perform abjad_refresh_status(s.id, 'T1');
  return to_jsonb(r) - 'text_hash' - 'student_id';
end $$;

create or replace function public.abjad_t1_delete(p_token text, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  perform abjad_t1_guard(p_token);
  s := abjad_require_student(p_token);
  delete from abjad_t1_passages where id = p_id and ann_id = s.ann_id;
  perform abjad_refresh_status(s.id, 'T1');
end $$;

create or replace function public.abjad_t2_answer(p_token text, p_unit text, p_confirmed boolean, p_sentiment text, p_reason text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; orig text; sent text;
begin
  perform abjad_t1_guard(p_token);
  s := abjad_require_student(p_token);
  if not exists (select 1 from abjad_t2_assign where unit_id = p_unit and ann_id = s.ann_id) then
    raise exception 'not_assigned';
  end if;
  select data->>'original_sentiment' into orig from abjad_t2_units where unit_id = p_unit;
  sent := case when p_confirmed then orig else p_sentiment end;
  if sent not in ('positive','negative','neutral') then raise exception 'invalid_sentiment'; end if;
  if not p_confirmed and (sent = orig or btrim(coalesce(p_reason,'')) = '') then raise exception 'reason_required'; end if;
  insert into abjad_t2_answers(unit_id, ann_id, student_id, confirmed, sentiment, reason, updated_at)
  values (p_unit, s.ann_id, s.id, p_confirmed, sent, case when p_confirmed then '' else left(p_reason, 1000) end, now())
  on conflict (unit_id, ann_id) do update set student_id = excluded.student_id, confirmed = excluded.confirmed,
    sentiment = excluded.sentiment, reason = excluded.reason, updated_at = now();
  perform abjad_refresh_status(s.id, 'T2');
  return abjad_progress(s.id, 'T2');
end $$;

revoke all on function public.abjad_t12_unlocked(uuid), public.abjad_t12_ready(uuid), public.abjad_t1_guard(text)
  from public, anon, authenticated;
