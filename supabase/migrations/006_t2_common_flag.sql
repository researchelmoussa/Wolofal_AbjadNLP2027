-- T2 list tells the student which items belong to the common (all-annotator) set
create or replace function public.abjad_t2_list(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s abjad_students;
begin
  s := abjad_require_student(p_token);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'unit_id', u.unit_id,
      'common', g.scope = 'all',
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

alter function public.abjad_word_count(text) set search_path = public;
