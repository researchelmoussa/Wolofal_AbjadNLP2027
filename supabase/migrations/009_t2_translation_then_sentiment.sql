-- Task 2 redesigned in two steps per item:
--   1. translation French → Wolofal: correct? if not, the annotator edits the Wolofal text
--   2. sentiment preserved? if not, the annotator picks positive / negative / neutral
-- The free comment becomes optional.

alter table public.abjad_t2_answers add column if not exists translation_ok boolean;
alter table public.abjad_t2_answers add column if not exists corrected_ajami text not null default '';

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
        jsonb_build_object('translation_ok', x.translation_ok, 'corrected', x.corrected_ajami,
                           'confirmed', x.confirmed, 'sentiment', x.sentiment, 'reason', x.reason) end
    ) order by g.position)
    from abjad_t2_assign g join abjad_t2_units u on u.unit_id = g.unit_id
    left join abjad_t2_answers x on x.unit_id = g.unit_id and x.ann_id = g.ann_id
    where g.ann_id = a), '[]'::jsonb);
end $$;

drop function if exists public.abjad_t2_answer(text, text, boolean, text, text);
create or replace function public.abjad_t2_answer(p_token text, p_unit text, p_translation_ok boolean, p_corrected text,
                                                  p_confirmed boolean, p_sentiment text, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students; orig text; orig_aj text; sent text; fixed text;
begin
  perform abjad_t1_guard(p_token);
  s := abjad_require_student(p_token);
  if not exists (select 1 from abjad_t2_assign where unit_id = p_unit and ann_id = s.ann_id) then
    raise exception 'not_assigned';
  end if;
  if p_translation_ok is null or p_confirmed is null then raise exception 'answer_both_steps'; end if;
  select data->>'original_sentiment', data->>'annotator_corrected_wolofal_ajami' into orig, orig_aj from abjad_t2_units where unit_id = p_unit;
  fixed := case when p_translation_ok then '' else btrim(coalesce(p_corrected, '')) end;
  if not p_translation_ok and (fixed = '' or fixed = btrim(orig_aj)) then raise exception 'translation_unchanged'; end if;
  sent := case when p_confirmed then orig else p_sentiment end;
  if sent not in ('positive','negative','neutral') or (not p_confirmed and sent = orig) then raise exception 'invalid_sentiment'; end if;
  insert into abjad_t2_answers(unit_id, ann_id, student_id, translation_ok, corrected_ajami, confirmed, sentiment, reason, updated_at)
  values (p_unit, s.ann_id, s.id, p_translation_ok, left(fixed, 5000), p_confirmed, sent, left(btrim(coalesce(p_note, '')), 1000), now())
  on conflict (unit_id, ann_id) do update set student_id = excluded.student_id, translation_ok = excluded.translation_ok,
    corrected_ajami = excluded.corrected_ajami, confirmed = excluded.confirmed, sentiment = excluded.sentiment,
    reason = excluded.reason, updated_at = now();
  perform abjad_refresh_status(s.id, 'T2');
  return abjad_progress(s.id, 'T2');
end $$;

-- translation answers for the admin dashboard and exports
create or replace function public.abjad_admin_t2_translations(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform abjad_require_admin(p_token);
  return coalesce((select jsonb_agg(jsonb_build_object('u', unit_id, 'a', ann_id, 'ok', translation_ok, 'c', corrected_ajami))
                   from abjad_t2_answers), '[]'::jsonb);
end $$;

revoke all on function public.abjad_t2_answer(text, text, boolean, text, boolean, text, text), public.abjad_admin_t2_translations(text) from public;
grant execute on function public.abjad_t2_answer(text, text, boolean, text, boolean, text, text), public.abjad_admin_t2_translations(text) to anon, authenticated;
