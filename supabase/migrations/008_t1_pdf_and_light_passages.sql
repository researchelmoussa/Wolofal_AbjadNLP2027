-- Task 1 redesigned: two options the student can mix freely
--   A. upload PDFs of the author's works (max 20 per annotator), stored in the private bucket abjad-t1-pdfs
--   B. document passages (max = target, 200) with only the passage and a book title / link
-- T1 is completed when either limit is reached.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('abjad-t1-pdfs', 'abjad-t1-pdfs', false, 52428800, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 52428800, allowed_mime_types = array['application/pdf'];

create table if not exists public.abjad_t1_pdfs (
  id           bigserial primary key,
  ann_id       text not null,
  student_id   uuid references public.abjad_students(id) on delete set null,
  author_id    text not null,
  author_name  text not null,
  file_name    text not null,
  storage_path text not null unique,
  size_bytes   bigint not null,
  created_at   timestamptz not null default now()
);
create index if not exists abjad_t1_pdfs_ann on public.abjad_t1_pdfs (ann_id);
alter table public.abjad_t1_pdfs enable row level security;

-- progress: T1 also reports the PDFs
create or replace function public.abjad_progress(p_student uuid, p_task text)
returns jsonb language plpgsql stable set search_path = public as $$
declare s abjad_students; tot int := 0; dn int := 0; np int := 0;
begin
  select * into s from abjad_students where id = p_student;
  if p_task = 'T0' then
    select count(*), count(a.text_id) into tot, dn
    from abjad_t0_texts x left join abjad_t0_answers a on a.text_id = x.id
    where x.in_sample and x.assigned_to = p_student;
  elsif p_task = 'T1' then
    select coalesce((select target from abjad_t1_authors where ann_id = s.ann_id), 200) into tot;
    select count(*) into dn from abjad_t1_passages where ann_id = s.ann_id;
    select count(*) into np from abjad_t1_pdfs where ann_id = s.ann_id;
    return jsonb_build_object('total', tot, 'done', dn, 'pdfs', np, 'pdf_max', 20);
  else
    select count(*), count(a.unit_id) into tot, dn
    from abjad_t2_assign g left join abjad_t2_answers a on a.unit_id = g.unit_id and a.ann_id = g.ann_id
    where g.ann_id = s.ann_id;
  end if;
  return jsonb_build_object('total', tot, 'done', dn);
end $$;

create or replace function public.abjad_refresh_status(p_student uuid, p_task text)
returns void language plpgsql volatile set search_path = public as $$
declare p jsonb; st text; dn int; tot int; np int;
begin
  p := abjad_progress(p_student, p_task);
  dn := (p->>'done')::int; tot := (p->>'total')::int; np := coalesce((p->>'pdfs')::int, 0);
  if dn = 0 and np = 0 then st := 'incomplete';
  elsif (tot > 0 and dn >= tot) or (p_task = 'T1' and np >= 20) then st := 'completed';
  else st := 'ongoing'; end if;
  update abjad_students set task_status = task_status || jsonb_build_object(p_task, st) where id = p_student;
end $$;

create or replace function public.abjad_t1_list(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; au abjad_t1_authors; a text;
begin
  s := abjad_require_student(p_token);
  a := abjad_t12_ready(s.id);
  select * into au from abjad_t1_authors where ann_id = a;
  return jsonb_build_object('ann_id', a, 'author', to_jsonb(au), 'pdf_max', 20,
    'passages', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'wolofal_passage', p.wolofal_passage,
                            'reference', p.reference, 'word_count', p.word_count, 'created_at', p.created_at) order by p.created_at desc)
                          from abjad_t1_passages p where p.ann_id = a), '[]'::jsonb),
    'pdfs', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'file_name', f.file_name, 'size_bytes', f.size_bytes,
                            'created_at', f.created_at) order by f.created_at desc)
                      from abjad_t1_pdfs f where f.ann_id = a), '[]'::jsonb));
end $$;

-- passages: only the passage (50–150 words) and a book title / link (required)
create or replace function public.abjad_t1_save(p_token text, p_id bigint, p_row jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare s abjad_students; au abjad_t1_authors; txt text; ref text; wc int; h text; r abjad_t1_passages;
begin
  perform abjad_t1_guard(p_token);
  s := abjad_require_student(p_token);
  select * into au from abjad_t1_authors where ann_id = s.ann_id;
  if au.ann_id is null then raise exception 'no_author'; end if;
  txt := btrim(regexp_replace(coalesce(p_row->>'wolofal_passage',''), '[ \t]+', ' ', 'g'));
  ref := left(btrim(coalesce(p_row->>'reference','')), 500);
  if ref = '' then raise exception 'reference_required'; end if;
  wc := abjad_word_count(txt);
  if wc < 50 or wc > 150 then raise exception 'word_count'; end if;
  h := encode(digest(regexp_replace(txt, '\s+', '', 'g'), 'sha256'), 'hex');
  if exists (select 1 from abjad_t1_passages where text_hash = h and id is distinct from p_id) then
    raise exception 'duplicate_passage';
  end if;
  if p_id is null then
    if (select count(*) from abjad_t1_passages where ann_id = s.ann_id) >= au.target then raise exception 'passage_limit'; end if;
    insert into abjad_t1_passages(ann_id, student_id, author_id, author_name, word_count, wolofal_passage, reference, text_hash)
    values (s.ann_id, s.id, au.author_id, au.author_name, wc, txt, ref, h)
    returning * into r;
  else
    update abjad_t1_passages set word_count = wc, wolofal_passage = txt, reference = ref, text_hash = h, updated_at = now()
    where id = p_id and ann_id = s.ann_id returning * into r;
    if r.id is null then raise exception 'not_found'; end if;
  end if;
  perform abjad_refresh_status(s.id, 'T1');
  return jsonb_build_object('id', r.id, 'wolofal_passage', r.wolofal_passage, 'reference', r.reference,
                            'word_count', r.word_count, 'created_at', r.created_at);
end $$;

-- PDFs: called only by the edge function abjad-t1-pdf (service role), which stores the file
create or replace function public.abjad_t1_pdf_check(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; a text;
begin
  s := abjad_require_student(p_token);
  a := abjad_t12_ready(s.id);
  if (select count(*) from abjad_t1_pdfs where ann_id = a) >= 20 then raise exception 'pdf_limit'; end if;
  return jsonb_build_object('ann_id', a, 'student_id', s.id);
end $$;

create or replace function public.abjad_t1_pdf_register(p_token text, p_name text, p_path text, p_size bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; a text; au abjad_t1_authors; f abjad_t1_pdfs;
begin
  s := abjad_require_student(p_token);
  a := abjad_t12_ready(s.id);
  if p_path not like a || '/%' then raise exception 'bad_path'; end if;
  if (select count(*) from abjad_t1_pdfs where ann_id = a) >= 20 then raise exception 'pdf_limit'; end if;
  select * into au from abjad_t1_authors where ann_id = a;
  insert into abjad_t1_pdfs(ann_id, student_id, author_id, author_name, file_name, storage_path, size_bytes)
  values (a, s.id, coalesce(au.author_id, ''), coalesce(au.author_name, ''), left(coalesce(nullif(btrim(p_name), ''), 'document.pdf'), 200), p_path, p_size)
  returning * into f;
  perform abjad_refresh_status(s.id, 'T1');
  return jsonb_build_object('id', f.id, 'file_name', f.file_name, 'size_bytes', f.size_bytes, 'created_at', f.created_at);
end $$;

create or replace function public.abjad_t1_pdf_delete(p_token text, p_id bigint)
returns text language plpgsql security definer set search_path = public as $$
declare s abjad_students; p text;
begin
  s := abjad_require_student(p_token);
  perform abjad_t12_ready(s.id);
  delete from abjad_t1_pdfs where id = p_id and ann_id = s.ann_id returning storage_path into p;
  perform abjad_refresh_status(s.id, 'T1');
  return p;
end $$;

-- path of a PDF the caller may open: the admin any, a student their own
create or replace function public.abjad_t1_pdf_path(p_token text, p_id bigint)
returns text language plpgsql security definer set search_path = public as $$
declare p text; sid uuid;
begin
  if exists (select 1 from abjad_sessions where token = p_token and role = 'admin' and expires_at > now()) then
    select storage_path into p from abjad_t1_pdfs where id = p_id;
  else
    select subject_id into sid from abjad_sessions where token = p_token and role = 'student' and expires_at > now();
    if sid is null then raise exception 'not_authorized'; end if;
    select f.storage_path into p from abjad_t1_pdfs f join abjad_students st on st.ann_id = f.ann_id where f.id = p_id and st.id = sid;
  end if;
  if p is null then raise exception 'not_found'; end if;
  return p;
end $$;

create or replace function public.abjad_admin_t1_pdfs(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform abjad_require_admin(p_token);
  return coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'ann_id', f.ann_id, 'author_id', f.author_id, 'author_name', f.author_name,
            'file_name', f.file_name, 'size_bytes', f.size_bytes, 'created_at', f.created_at,
            'student', coalesce(s.full_name, s.email, '')) order by f.ann_id, f.created_at)
          from abjad_t1_pdfs f left join abjad_students s on s.id = f.student_id), '[]'::jsonb);
end $$;

-- admin stats: add PDF counts to the T1 block (rest unchanged)
create or replace function public.abjad_admin_t1_pdf_counts(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform abjad_require_admin(p_token);
  return jsonb_build_object('total', (select count(*) from abjad_t1_pdfs),
    'bytes', (select coalesce(sum(size_bytes), 0) from abjad_t1_pdfs),
    'per_ann', coalesce((select jsonb_object_agg(ann_id, n) from (select ann_id, count(*) n from abjad_t1_pdfs group by 1) z), '{}'::jsonb));
end $$;

revoke all on function public.abjad_t1_pdf_check(text), public.abjad_t1_pdf_register(text, text, text, bigint),
  public.abjad_t1_pdf_delete(text, bigint), public.abjad_t1_pdf_path(text, bigint) from public, anon, authenticated;
grant execute on function public.abjad_t1_pdf_check(text), public.abjad_t1_pdf_register(text, text, text, bigint),
  public.abjad_t1_pdf_delete(text, bigint), public.abjad_t1_pdf_path(text, bigint) to service_role;
revoke all on function public.abjad_admin_t1_pdfs(text), public.abjad_admin_t1_pdf_counts(text) from public;
grant execute on function public.abjad_admin_t1_pdfs(text), public.abjad_admin_t1_pdf_counts(text) to anon, authenticated;
