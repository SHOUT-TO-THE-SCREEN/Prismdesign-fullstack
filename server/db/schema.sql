create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now(),
  constraint users_email_unique unique (email),
  constraint users_email_not_blank check (length(trim(email)) between 3 and 254),
  constraint users_name_not_blank check (length(trim(name)) between 1 and 100),
  constraint users_password_hash_not_blank check (length(password_hash) > 0)
);

create table if not exists public.graphs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  params_by_id jsonb not null default '{}'::jsonb,
  node_kind_by_id jsonb not null default '{}'::jsonb,
  thumbnail text,
  node_count integer not null default 0,
  edge_count integer not null default 0,
  node_kinds jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint graphs_user_name_unique unique (user_id, name),
  constraint graphs_name_valid check (
    length(trim(name)) between 1 and 100
    and name !~ '[[:cntrl:]/\\]'
  ),
  constraint graphs_nodes_array check (jsonb_typeof(nodes) = 'array'),
  constraint graphs_edges_array check (jsonb_typeof(edges) = 'array'),
  constraint graphs_params_object check (jsonb_typeof(params_by_id) = 'object'),
  constraint graphs_node_kind_object check (jsonb_typeof(node_kind_by_id) = 'object'),
  constraint graphs_node_kinds_array check (jsonb_typeof(node_kinds) = 'array'),
  constraint graphs_counts_non_negative check (node_count >= 0 and edge_count >= 0)
);

create index if not exists graphs_user_updated_at_idx
  on public.graphs (user_id, updated_at desc);

alter table public.users enable row level security;
alter table public.graphs enable row level security;

-- The Express server uses an elevated server-only key. Browser roles get no
-- direct table access; all authorization is enforced by the API's JWT user ID.
revoke all on table public.users from anon, authenticated;
revoke all on table public.graphs from anon, authenticated;
