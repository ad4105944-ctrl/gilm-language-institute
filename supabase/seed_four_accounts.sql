-- GILM Seed script for four accounts: Ahmed, Amar, Cheybai, Tiki
-- This script ensures profiles and initial language profiles exist for the four authorized users.

do $$
declare
  r record;
begin
  for r in 
    select id, email from auth.users where email in ('ahmed@gilm.example', 'amar@gilm.example', 'cheybai@gilm.example', 'tiki@gilm.example')
  loop
    insert into public.profiles (id, full_name, interests, target_goal)
    values (r.id, initcap(split_part(r.email, '@', 1)), 'Languages and AI', 'Professional Fluency')
    on conflict (id) do nothing;

    insert into public.student_language_profiles (user_id, language, speaking_score, vocabulary_score, grammar_score, listening_score, reading_score)
    values 
      (r.id, 'en', 0, 0, 0, 0, 0),
      (r.id, 'fr', 0, 0, 0, 0, 0)
    on conflict (user_id, language) do nothing;
  end loop;
end;
$$;

-- Verification query: should return exactly 4 profiles
select count(*) as profile_count from public.profiles;
