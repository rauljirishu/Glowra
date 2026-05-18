create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age integer not null check (age between 13 and 120),
  gender text not null,
  phone text not null,
  email text not null,
  theme_preference text not null default 'Soft K-beauty',
  template_preference text not null default 'Editorial cards',
  is_premium boolean not null default false,
  terms_accepted_at timestamptz not null,
  cookies_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analysis_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('color_suit', 'hair_analysis')),
  image_path text not null,
  answers_json jsonb not null default '{}'::jsonb,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create table if not exists public.analysis_results (
  request_id uuid primary key references public.analysis_requests(id) on delete cascade,
  result_json jsonb not null,
  confidence numeric not null default 0,
  model text not null,
  premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  checkout_session_id text unique,
  status text not null,
  plan text not null default 'premium_beta',
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('glowra-private', 'glowra-private', false)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.analysis_requests enable row level security;
alter table public.analysis_results enable row level security;
alter table public.payments enable row level security;

create policy "Profiles are private"
  on public.profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Analysis requests are private"
  on public.analysis_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Analysis results are private"
  on public.analysis_results for select
  using (
    exists (
      select 1 from public.analysis_requests
      where analysis_requests.id = analysis_results.request_id
      and analysis_requests.user_id = auth.uid()
    )
  );

create policy "Payments are private"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Users can upload their own Glowra images"
  on storage.objects for insert
  with check (
    bucket_id = 'glowra-private'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own Glowra images"
  on storage.objects for select
  using (
    bucket_id = 'glowra-private'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
