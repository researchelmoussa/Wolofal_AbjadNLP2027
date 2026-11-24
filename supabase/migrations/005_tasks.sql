-- Task workspaces: T0 Verify, T1 Augment, T2 Annotate.
-- Same model as 001: tables are locked (RLS on, no policies) and the page only
-- calls the SECURITY DEFINER functions below, each of which checks a session token.

-- ───────── participants get an annotator id (ANN_01 … ANN_08) ─────────
alter table public.abjad_students add column if not exists ann_id text unique
  check (ann_id ~ '^ANN_[0-9]{2}$');

-- ───────── source files (header kept in its original order for exports) ─────────
create table if not exists public.abjad_files (
  name   text primary key,             -- path inside AbjadNLP2027-Wolofal-Data
  task   text not null check (task in ('T0','T2')),
  header jsonb not null,               -- ["col1","col2",…]
  ord    int not null default 0
);

-- ───────── T0 · Verify ─────────
-- one row per distinct Wolofal text; a text found in several CSVs is verified once
create table if not exists public.abjad_t0_texts (
  id          int primary key,
  text        text not null,
  grp         text not null,           -- author_passages | codeswitch | monolingual
  in_sample   boolean not null default false,
  sample_rank int,                      -- random order inside the 50 % sample
  assigned_to uuid references public.abjad_students(id) on delete set null
);
create index if not exists abjad_t0_texts_assigned on public.abjad_t0_texts (assigned_to) where in_sample;

create table if not exists public.abjad_t0_rows (
  file    text not null references public.abjad_files(name),
  row_idx int  not null,
  text_id int  not null references public.abjad_t0_texts(id),
  data    jsonb not null,
  primary key (file, row_idx)
);
create index if not exists abjad_t0_rows_text on public.abjad_t0_rows (text_id);

create table if not exists public.abjad_t0_answers (
  text_id     int primary key references public.abjad_t0_texts(id) on delete cascade,
  student_id  uuid references public.abjad_students(id) on delete set null,
  by_label    text not null default '',
  verdict     text not null check (verdict in ('yes','no')),
  reason_code text not null default '',
  reason      text not null default '',
  updated_at  timestamptz not null default now()
);

-- ───────── T1 · Augment ─────────
create table if not exists public.abjad_t1_authors (
  ann_id          text primary key,
  author_id       text not null,
  author_name     text not null,
  primary_sources text not null default '',
  target          int  not null default 200
);

create table if not exists public.abjad_t1_passages (
  id                   bigserial primary key,
  ann_id               text not null,
  student_id           uuid references public.abjad_students(id) on delete set null,
  author_id            text not null,
  author_name          text not null,
  work_title           text not null default '',
  doc_id               text not null default 'DOC01',
  genre                text not null default '',
  period               text not null default '',
  word_count           int  not null,
  self_mention_removed text not null default 'No',
  wolofal_passage      text not null,
  wolof_latin_optional text not null default '',
  notes                text not null default '',
  source_collection    text not null default '',
  reference            text not null default '',
  method               text not null default '',
  text_hash            text not null unique,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists abjad_t1_passages_ann on public.abjad_t1_passages (ann_id);

-- ───────── T2 · Annotate ─────────
create table if not exists public.abjad_t2_units (
  unit_id   text primary key,
  data      jsonb not null,
  is_common boolean not null default false   -- the 5 % set annotated by every annotator
);

create table if not exists public.abjad_t2_rows (       -- the original pack rows
  file    text not null references public.abjad_files(name),
  row_idx int  not null,
  ann_id  text not null,
  unit_id text not null references public.abjad_t2_units(unit_id),
  data    jsonb not null,
  primary key (file, row_idx)
);

create table if not exists public.abjad_t2_assign (
  unit_id  text not null references public.abjad_t2_units(unit_id),
  ann_id   text not null,
  scope    text not null check (scope in ('all','pair','single')),
  position int  not null,
  primary key (unit_id, ann_id)
);

create table if not exists public.abjad_t2_answers (
  unit_id    text not null,
  ann_id     text not null,
  student_id uuid references public.abjad_students(id) on delete set null,
  confirmed  boolean not null,
  sentiment  text not null check (sentiment in ('positive','negative','neutral')),
  reason     text not null default '',
  updated_at timestamptz not null default now(),
  primary key (unit_id, ann_id),
  foreign key (unit_id, ann_id) references public.abjad_t2_assign(unit_id, ann_id)
);

alter table public.abjad_files      enable row level security;
alter table public.abjad_t0_texts   enable row level security;
alter table public.abjad_t0_rows    enable row level security;
alter table public.abjad_t0_answers enable row level security;
alter table public.abjad_t1_authors enable row level security;
alter table public.abjad_t1_passages enable row level security;
alter table public.abjad_t2_units   enable row level security;
alter table public.abjad_t2_rows    enable row level security;
alter table public.abjad_t2_assign  enable row level security;
alter table public.abjad_t2_answers enable row level security;

-- ───────── helpers ─────────
create or replace function public.abjad_require_student(p_token text)
returns public.abjad_students language plpgsql stable set search_path = public as $$
declare s abjad_students;
begin
  select st.* into s from abjad_sessions se join abjad_students st on st.id = se.subject_id
  where se.token = p_token and se.role = 'student' and se.expires_at > now() and st.active;
  if s.id is null then raise exception 'not_authorized'; end if;
  return s;
end $$;

-- per-task progress of one student: {total, done}
create or replace function public.abjad_progress(p_student uuid, p_task text)
returns jsonb language plpgsql stable set search_path = public as $$
declare s abjad_students; tot int := 0; dn int := 0;
begin
  select * into s from abjad_students where id = p_student;
  if p_task = 'T0' then
    select count(*), count(a.text_id) into tot, dn
    from abjad_t0_texts x left join abjad_t0_answers a on a.text_id = x.id
    where x.in_sample and x.assigned_to = p_student;
  elsif p_task = 'T1' then
    select coalesce((select target from abjad_t1_authors where ann_id = s.ann_id), 0) into tot;
    select count(*) into dn from abjad_t1_passages where ann_id = s.ann_id;
  else
    select count(*), count(a.unit_id) into tot, dn
    from abjad_t2_assign g left join abjad_t2_answers a on a.unit_id = g.unit_id and a.ann_id = g.ann_id
    where g.ann_id = s.ann_id;
  end if;
  return jsonb_build_object('total', tot, 'done', dn);
end $$;

-- status follows the work: ongoing after the first answer, completed when all is done
create or replace function public.abjad_refresh_status(p_student uuid, p_task text)
returns void language plpgsql volatile set search_path = public as $$
declare p jsonb; st text;
begin
  p := abjad_progress(p_student, p_task);
  if (p->>'done')::int = 0 then st := 'incomplete';
  elsif (p->>'done')::int >= (p->>'total')::int and (p->>'total')::int > 0 then st := 'completed';
  else st := 'ongoing'; end if;
  update abjad_students set task_status = task_status || jsonb_build_object(p_task, st) where id = p_student;
end $$;

create or replace function public.abjad_word_count(p text)
returns int language sql immutable as $$
  select case when btrim(coalesce(p, '')) = '' then 0
              else array_length(regexp_split_to_array(btrim(p), '\s+'), 1) end
$$;

-- ───────── student: overview ─────────
create or replace function public.abjad_student_tasks(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; au abjad_t1_authors;
begin
  s := abjad_require_student(p_token);
  select * into au from abjad_t1_authors where ann_id = s.ann_id;
  return jsonb_build_object(
    'ann_id', s.ann_id, 'tasks', s.tasks, 'task_status', s.task_status,
    'full_name', s.full_name, 'email', s.email,
    'T0', abjad_progress(s.id, 'T0'),
    'T1', abjad_progress(s.id, 'T1') || jsonb_build_object('author_name', au.author_name, 'author_id', au.author_id),
    'T2', abjad_progress(s.id, 'T2'));
end $$;

-- ───────── student: T0 ─────────
create or replace function public.abjad_t0_list(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  s := abjad_require_student(p_token);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', x.id, 'text', x.text, 'grp', x.grp,
      'file', r.file, 'row', r.row_idx + 2,
      'work', coalesce(r.data->>'work_title', r.data->>'source_work', ''),
      'author', coalesce(r.data->>'author_name', ''),
      'verdict', a.verdict, 'reason_code', a.reason_code, 'reason', a.reason) order by x.sample_rank)
    from abjad_t0_texts x
    left join abjad_t0_answers a on a.text_id = x.id
    left join lateral (select file, row_idx, data from abjad_t0_rows where text_id = x.id order by file, row_idx limit 1) r on true
    where x.in_sample and x.assigned_to = s.id), '[]'::jsonb);
end $$;

create or replace function public.abjad_t0_answer(p_token text, p_id int, p_verdict text, p_reason_code text, p_reason text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  s := abjad_require_student(p_token);
  if not exists (select 1 from abjad_t0_texts where id = p_id and in_sample and assigned_to = s.id) then
    raise exception 'not_assigned';
  end if;
  if p_verdict not in ('yes','no') then raise exception 'invalid_verdict'; end if;
  if p_verdict = 'no' and btrim(coalesce(p_reason_code,'')) = '' and btrim(coalesce(p_reason,'')) = '' then
    raise exception 'reason_required';
  end if;
  insert into abjad_t0_answers(text_id, student_id, by_label, verdict, reason_code, reason, updated_at)
  values (p_id, s.id, coalesce(s.ann_id, s.email), p_verdict,
          case when p_verdict = 'no' then coalesce(p_reason_code,'') else '' end,
          case when p_verdict = 'no' then left(coalesce(p_reason,''), 1000) else '' end, now())
  on conflict (text_id) do update set student_id = excluded.student_id, by_label = excluded.by_label,
    verdict = excluded.verdict, reason_code = excluded.reason_code, reason = excluded.reason, updated_at = now();
  perform abjad_refresh_status(s.id, 'T0');
  return abjad_progress(s.id, 'T0');
end $$;

-- ───────── student: T1 ─────────
create or replace function public.abjad_t1_list(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; au abjad_t1_authors;
begin
  s := abjad_require_student(p_token);
  select * into au from abjad_t1_authors where ann_id = s.ann_id;
  return jsonb_build_object('ann_id', s.ann_id, 'author', to_jsonb(au),
    'passages', coalesce((select jsonb_agg(to_jsonb(p) - 'text_hash' - 'student_id' order by p.created_at desc)
                          from abjad_t1_passages p where p.ann_id = s.ann_id), '[]'::jsonb));
end $$;

create or replace function public.abjad_t1_save(p_token text, p_id bigint, p_row jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare s abjad_students; au abjad_t1_authors; txt text; wc int; h text; r abjad_t1_passages;
begin
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
  s := abjad_require_student(p_token);
  delete from abjad_t1_passages where id = p_id and ann_id = s.ann_id;
  perform abjad_refresh_status(s.id, 'T1');
end $$;

-- ───────── student: T2 ─────────
create or replace function public.abjad_t2_list(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  s := abjad_require_student(p_token);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'unit_id', u.unit_id,
      'ajami', u.data->>'annotator_corrected_wolofal_ajami',
      'sentiment', u.data->>'original_sentiment',
      'gloss_fr', u.data->>'french_helper_gloss',
      'msa', u.data->>'source_msa',
      'latin', u.data->>'draft_wolof_latin',
      'answer', case when a.unit_id is null then null else
        jsonb_build_object('confirmed', a.confirmed, 'sentiment', a.sentiment, 'reason', a.reason) end
    ) order by g.position)
    from abjad_t2_assign g join abjad_t2_units u on u.unit_id = g.unit_id
    left join abjad_t2_answers a on a.unit_id = g.unit_id and a.ann_id = g.ann_id
    where g.ann_id = s.ann_id), '[]'::jsonb);
end $$;

create or replace function public.abjad_t2_answer(p_token text, p_unit text, p_confirmed boolean, p_sentiment text, p_reason text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; orig text; sent text;
begin
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

-- ───────── admin: allocation ─────────
-- Spread the T0 sample over active students who have T0. Texts already answered stay
-- with whoever answered them; unanswered texts of students who left are handed over.
create or replace function public.abjad_admin_allocate_t0(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare ids uuid[]; cnt int[]; n int; i int; k int; x record;
begin
  perform abjad_require_admin(p_token);
  select array_agg(id order by created_at, id) into ids from abjad_students where active and 'T0' = any(tasks);
  n := coalesce(array_length(ids, 1), 0);
  if n = 0 then raise exception 'no_students'; end if;
  update abjad_t0_texts t set assigned_to = null
  where in_sample and assigned_to is not null and not (assigned_to = any(ids))
    and not exists (select 1 from abjad_t0_answers a where a.text_id = t.id);
  cnt := array_fill(0, array[n]);
  for i in 1..n loop
    cnt[i] := (select count(*) from abjad_t0_texts where in_sample and assigned_to = ids[i]);
  end loop;
  for x in select id from abjad_t0_texts where in_sample and assigned_to is null order by sample_rank loop
    k := 1;
    for i in 2..n loop if cnt[i] < cnt[k] then k := i; end if; end loop;
    update abjad_t0_texts set assigned_to = ids[k] where id = x.id;
    cnt[k] := cnt[k] + 1;
  end loop;
  return jsonb_build_object('students', n, 'per_student', to_jsonb(cnt));
end $$;

create or replace function public.abjad_admin_set_ann(p_token text, p_id uuid, p_ann text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  perform abjad_require_admin(p_token);
  update abjad_students set ann_id = nullif(btrim(p_ann), '') where id = p_id returning * into s;
  if s.id is null then raise exception 'not_found'; end if;
  perform abjad_refresh_status(s.id, 'T1');
  perform abjad_refresh_status(s.id, 'T2');
  return to_jsonb(s);
end $$;

create or replace function public.abjad_admin_set_author(p_token text, p_ann text, p_author_id text, p_author_name text, p_target int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare au abjad_t1_authors;
begin
  perform abjad_require_admin(p_token);
  insert into abjad_t1_authors(ann_id, author_id, author_name, target)
  values (p_ann, btrim(p_author_id), btrim(p_author_name), coalesce(p_target, 200))
  on conflict (ann_id) do update set author_id = excluded.author_id, author_name = excluded.author_name, target = excluded.target
  returning * into au;
  return to_jsonb(au);
end $$;

-- ───────── admin: dashboard ─────────
create or replace function public.abjad_admin_task_stats(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform abjad_require_admin(p_token);
  return jsonb_build_object(
    't0', jsonb_build_object(
      'corpus_texts', (select count(*) from abjad_t0_texts),
      'corpus_rows',  (select count(*) from abjad_t0_rows),
      'sample',       (select count(*) from abjad_t0_texts where in_sample),
      'allocated',    (select count(*) from abjad_t0_texts where in_sample and assigned_to is not null),
      'answered',     (select count(*) from abjad_t0_answers),
      'yes',          (select count(*) from abjad_t0_answers where verdict = 'yes'),
      'no',           (select count(*) from abjad_t0_answers where verdict = 'no'),
      'reasons',      coalesce((select jsonb_object_agg(rc, c) from (select coalesce(nullif(reason_code,''),'other') rc, count(*) c
                         from abjad_t0_answers where verdict = 'no' group by 1) z), '{}'::jsonb),
      'groups',       coalesce((select jsonb_agg(jsonb_build_object('grp', grp, 'texts', n, 'sample', s, 'answered', a, 'yes', y) order by grp)
                         from (select x.grp, count(*) n, count(*) filter (where in_sample) s, count(a.text_id) a,
                                      count(*) filter (where a.verdict = 'yes') y
                               from abjad_t0_texts x left join abjad_t0_answers a on a.text_id = x.id group by x.grp) z), '[]'::jsonb),
      'files',        coalesce((select jsonb_agg(jsonb_build_object('file', file, 'rows', n, 'sample', s, 'answered', a) order by file)
                         from (select r.file, count(*) n, count(*) filter (where x.in_sample) s, count(a.text_id) a
                               from abjad_t0_rows r join abjad_t0_texts x on x.id = r.text_id
                               left join abjad_t0_answers a on a.text_id = r.text_id group by r.file) z), '[]'::jsonb)),
    't1', jsonb_build_object(
      'authors', coalesce((select jsonb_agg(jsonb_build_object('ann_id', au.ann_id, 'author_id', au.author_id, 'author_name', au.author_name,
                    'target', au.target, 'primary_sources', au.primary_sources,
                    'done', (select count(*) from abjad_t1_passages p where p.ann_id = au.ann_id)) order by au.ann_id)
                  from abjad_t1_authors au), '[]'::jsonb),
      'total',   (select count(*) from abjad_t1_passages),
      'words',   (select coalesce(sum(word_count),0) from abjad_t1_passages),
      'sources', coalesce((select jsonb_object_agg(sc, c) from (select coalesce(nullif(source_collection,''),'Other') sc, count(*) c
                    from abjad_t1_passages group by 1) z), '{}'::jsonb)),
    't2', jsonb_build_object(
      'units',       (select count(*) from abjad_t2_units),
      'common',      (select count(*) from abjad_t2_units where is_common),
      'assignments', (select count(*) from abjad_t2_assign),
      'answered',    (select count(*) from abjad_t2_answers),
      'units_done',  (select count(distinct unit_id) from abjad_t2_answers),
      'confirmed',   (select count(*) from abjad_t2_answers where confirmed),
      'changes',     coalesce((select jsonb_object_agg(k, c) from (select (u.data->>'original_sentiment') || '→' || a.sentiment k, count(*) c
                        from abjad_t2_answers a join abjad_t2_units u using (unit_id) where not a.confirmed group by 1) z), '{}'::jsonb),
      'packs',       coalesce((select jsonb_agg(jsonb_build_object('ann_id', ann_id, 'assigned', n, 'answered', a, 'confirmed', c) order by ann_id)
                        from (select g.ann_id, count(*) n, count(x.unit_id) a, count(*) filter (where x.confirmed) c
                              from abjad_t2_assign g left join abjad_t2_answers x on x.unit_id = g.unit_id and x.ann_id = g.ann_id
                              group by g.ann_id) z), '[]'::jsonb),
      -- every answer on units with more than one annotator, for agreement scores
      'iaa',         coalesce((select jsonb_agg(jsonb_build_object('u', a.unit_id, 'a', a.ann_id, 's', a.sentiment, 'scope', g.scope,
                        'o', u.data->>'original_sentiment', 'r', a.reason))
                        from abjad_t2_answers a join abjad_t2_assign g using (unit_id, ann_id) join abjad_t2_units u using (unit_id)
                        where g.scope <> 'single'), '[]'::jsonb)),
    'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'full_name', s.full_name, 'email', s.email,
                    'ann_id', s.ann_id, 'active', s.active, 'tasks', s.tasks,
                    'T0', abjad_progress(s.id, 'T0') || jsonb_build_object(
                            'yes', (select count(*) from abjad_t0_answers a join abjad_t0_texts x on x.id = a.text_id where x.assigned_to = s.id and a.verdict = 'yes'),
                            'no',  (select count(*) from abjad_t0_answers a join abjad_t0_texts x on x.id = a.text_id where x.assigned_to = s.id and a.verdict = 'no')),
                    'T1', abjad_progress(s.id, 'T1'),
                    'T2', abjad_progress(s.id, 'T2'),
                    'last', greatest(
                       (select max(a.updated_at) from abjad_t0_answers a where a.student_id = s.id),
                       (select max(p.updated_at) from abjad_t1_passages p where p.student_id = s.id),
                       (select max(a.updated_at) from abjad_t2_answers a where a.student_id = s.id)))
                  order by s.ann_id nulls last, s.full_name) from abjad_students s), '[]'::jsonb));
end $$;

-- ───────── admin: exports (the page turns these into CSV / JSON) ─────────
create or replace function public.abjad_admin_export(p_token text, p_task text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform abjad_require_admin(p_token);
  if p_task = 'T0' then
    return coalesce((select jsonb_agg(jsonb_build_object('name', f.name, 'header', f.header, 'rows',
      (select jsonb_agg(jsonb_build_object('data', r.data, 'text_id', r.text_id, 'in_sample', x.in_sample,
                 'verdict', a.verdict, 'reason_code', a.reason_code, 'reason', a.reason, 'by', a.by_label, 'at', a.updated_at)
               order by r.row_idx)
       from abjad_t0_rows r join abjad_t0_texts x on x.id = r.text_id left join abjad_t0_answers a on a.text_id = r.text_id
       where r.file = f.name)) order by f.ord)
      from abjad_files f where f.task = 'T0'), '[]'::jsonb);
  elsif p_task = 'T1' then
    return coalesce((select jsonb_agg(to_jsonb(p) - 'text_hash' - 'student_id' order by p.author_id, p.doc_id, p.created_at)
                     from abjad_t1_passages p), '[]'::jsonb);
  elsif p_task = 'T2' then
    return jsonb_build_object(
      'files', coalesce((select jsonb_agg(jsonb_build_object('name', f.name, 'header', f.header, 'ann_id', pk.ann_id, 'rows',
        (select jsonb_agg(jsonb_build_object('data', coalesce(r.data, u.data || jsonb_build_object('annotator_id', g.ann_id, 'is_iaa_overlap', 'Yes')),
                   'scope', g.scope, 'confirmed', a.confirmed, 'sentiment', a.sentiment, 'reason', a.reason, 'at', a.updated_at)
                 order by (r.row_idx is null), r.row_idx, g.position)
         from abjad_t2_assign g join abjad_t2_units u on u.unit_id = g.unit_id
         left join abjad_t2_rows r on r.unit_id = g.unit_id and r.ann_id = g.ann_id and r.file = f.name
         left join abjad_t2_answers a on a.unit_id = g.unit_id and a.ann_id = g.ann_id
         where g.ann_id = pk.ann_id)) order by f.ord)
        from abjad_files f join lateral (select distinct ann_id from abjad_t2_rows where file = f.name) pk on true
        where f.task = 'T2'), '[]'::jsonb),
      'common', coalesce((select jsonb_agg(jsonb_build_object('unit_id', u.unit_id, 'data', u.data,
        'answers', (select jsonb_object_agg(a.ann_id, jsonb_build_object('sentiment', a.sentiment, 'confirmed', a.confirmed, 'reason', a.reason))
                    from abjad_t2_answers a where a.unit_id = u.unit_id)) order by u.unit_id)
        from abjad_t2_units u where u.is_common), '[]'::jsonb));
  end if;
  raise exception 'invalid_task';
end $$;

-- students see their annotator id
create or replace function public.abjad_student_me(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  select st.* into s from abjad_sessions se join abjad_students st on st.id = se.subject_id
  where se.token = p_token and se.role = 'student' and se.expires_at > now() and st.active;
  if s.id is null then return null; end if;
  return jsonb_build_object('email', s.email, 'full_name', s.full_name, 'ann_id', s.ann_id,
    'institution', s.institution, 'tasks', s.tasks, 'task_status', s.task_status);
end $$;

-- ───────── permissions ─────────
revoke all on function public.abjad_require_student(text), public.abjad_progress(uuid, text),
  public.abjad_refresh_status(uuid, text), public.abjad_word_count(text) from public, anon, authenticated;

revoke all on function
  public.abjad_student_tasks(text), public.abjad_t0_list(text), public.abjad_t0_answer(text, int, text, text, text),
  public.abjad_t1_list(text), public.abjad_t1_save(text, bigint, jsonb), public.abjad_t1_delete(text, bigint),
  public.abjad_t2_list(text), public.abjad_t2_answer(text, text, boolean, text, text),
  public.abjad_admin_allocate_t0(text), public.abjad_admin_set_ann(text, uuid, text),
  public.abjad_admin_set_author(text, text, text, text, int), public.abjad_admin_task_stats(text),
  public.abjad_admin_export(text, text)
from public;
grant execute on function
  public.abjad_student_tasks(text), public.abjad_t0_list(text), public.abjad_t0_answer(text, int, text, text, text),
  public.abjad_t1_list(text), public.abjad_t1_save(text, bigint, jsonb), public.abjad_t1_delete(text, bigint),
  public.abjad_t2_list(text), public.abjad_t2_answer(text, text, boolean, text, text),
  public.abjad_admin_allocate_t0(text), public.abjad_admin_set_ann(text, uuid, text),
  public.abjad_admin_set_author(text, text, text, text, int), public.abjad_admin_task_stats(text),
  public.abjad_admin_export(text, text)
to anon, authenticated;
