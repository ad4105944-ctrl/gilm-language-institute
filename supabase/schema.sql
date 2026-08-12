-- GILM Production Schema for Supabase Postgres with RLS
-- Tables: profiles, student_language_profiles, learning_sessions, conversation_messages,
-- learning_evidence, observed_errors, vocabulary_mastery, grammar_mastery, daily_plans, ai_decisions

create extension if not exists "uuid-ossp";

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  interests text,
  target_goal text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Student language profiles (separate en and fr)
create table if not exists public.student_language_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  language varchar(10) not null check (language in ('en', 'fr')),
  speaking_score numeric(5,2) default 0,
  vocabulary_score numeric(5,2) default 0,
  grammar_score numeric(5,2) default 0,
  listening_score numeric(5,2) default 0,
  reading_score numeric(5,2) default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, language)
);

-- 3. Learning sessions
create table if not exists public.learning_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  language varchar(10) not null check (language in ('en', 'fr')),
  session_date date default current_date not null,
  duration_minutes integer default 15 not null,
  status varchar(20) default 'active' not null,
  created_at timestamptz default now() not null
);

-- 4. Conversation messages
create table if not exists public.conversation_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.learning_sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sender varchar(20) not null check (sender in ('student', 'teacher')),
  message_text text not null,
  created_at timestamptz default now() not null
);

-- 5. Learning evidence
create table if not exists public.learning_evidence (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid references public.learning_sessions(id) on delete cascade,
  language varchar(10) not null check (language in ('en', 'fr')),
  skill_type varchar(50) not null,
  evidence_snippet text not null,
  confidence numeric(3,2) not null check (confidence >= 0 and confidence <= 1),
  created_at timestamptz default now() not null
);

-- 6. Observed errors
create table if not exists public.observed_errors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid references public.learning_sessions(id) on delete cascade,
  language varchar(10) not null check (language in ('en', 'fr')),
  error_pattern text not null,
  correction text not null,
  status varchar(20) default 'observed' not null,
  created_at timestamptz default now() not null
);

-- 7. Vocabulary mastery
create table if not exists public.vocabulary_mastery (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  language varchar(10) not null check (language in ('en', 'fr')),
  word text not null,
  mastery_state varchar(30) default 'seen' not null check (mastery_state in ('seen', 'recognized', 'recalled', 'produced_with_help', 'produced_independent', 'spontaneous')),
  mastery_score numeric(5,2) default 0 not null,
  next_review_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, language, word)
);

-- 8. Grammar mastery
create table if not exists public.grammar_mastery (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  language varchar(10) not null check (language in ('en', 'fr')),
  grammar_concept text not null,
  mastery_state varchar(30) default 'error' not null check (mastery_state in ('error', 'correct_with_help', 'correct_independent', 'spontaneous')),
  mastery_score numeric(5,2) default 0 not null,
  updated_at timestamptz default now() not null,
  unique (user_id, language, grammar_concept)
);

-- 9. Daily plans
create table if not exists public.daily_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  language varchar(10) not null check (language in ('en', 'fr')),
  plan_date date default current_date not null,
  focus_elements jsonb not null,
  tasks jsonb not null,
  created_at timestamptz default now() not null,
  unique (user_id, language, plan_date)
);

-- 10. AI decisions
create table if not exists public.ai_decisions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid references public.learning_sessions(id) on delete cascade,
  decision_summary text not null,
  next_focus text not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.student_language_profiles enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.learning_evidence enable row level security;
alter table public.observed_errors enable row level security;
alter table public.vocabulary_mastery enable row level security;
alter table public.grammar_mastery enable row level security;
alter table public.daily_plans enable row level security;
alter table public.ai_decisions enable row level security;

-- RLS Policies (User can read and write only their own rows)
create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can manage own language profiles" on public.student_language_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own sessions" on public.learning_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own messages" on public.conversation_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own evidence" on public.learning_evidence for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own errors" on public.observed_errors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own vocabulary" on public.vocabulary_mastery for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own grammar" on public.grammar_mastery for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own plans" on public.daily_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own decisions" on public.ai_decisions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger function to auto-create profile and language profiles on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, interests, target_goal)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 'General learning', 'Master fluency')
  on conflict (id) do nothing;

  insert into public.student_language_profiles (user_id, language, speaking_score, vocabulary_score, grammar_score, listening_score, reading_score)
  values 
    (new.id, 'en', 0, 0, 0, 0, 0),
    (new.id, 'fr', 0, 0, 0, 0, 0)
  on conflict (user_id, language) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
