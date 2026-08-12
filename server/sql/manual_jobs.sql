create table if not exists public.manual_jobs (
  id text primary key,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload jsonb not null
);

create index if not exists manual_jobs_created_at_idx
  on public.manual_jobs (created_at desc);
