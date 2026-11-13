-- Pin search_path on the remaining helper (Supabase security advisor).
-- The other advisor warnings (public SECURITY DEFINER functions) are by design:
-- these functions are the portal's API and each one checks a session token.
alter function public.abjad_clean_tasks(jsonb) set search_path = public;
