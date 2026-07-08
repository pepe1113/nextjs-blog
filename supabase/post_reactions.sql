create table if not exists public.post_reactions (
  post_slug text primary key,
  clap_count integer not null default 0 check (clap_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.post_reactions enable row level security;

create policy "Service role can manage post reactions"
on public.post_reactions
for all
to service_role
using (true)
with check (true);

revoke all on table public.post_reactions from anon, authenticated;
grant select, insert, update on table public.post_reactions to service_role;

create or replace function public.increment_post_claps(p_post_slug text, p_delta integer)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  next_count integer;
begin
  if p_post_slug is null or length(trim(p_post_slug)) = 0 or length(p_post_slug) > 200 then
    raise exception 'Invalid post slug';
  end if;

  if p_delta is null or p_delta < 1 or p_delta > 10 then
    raise exception 'Invalid clap delta';
  end if;

  insert into public.post_reactions as reactions (post_slug, clap_count, updated_at)
  values (p_post_slug, p_delta, now())
  on conflict (post_slug)
  do update set
    clap_count = reactions.clap_count + excluded.clap_count,
    updated_at = now()
  returning clap_count into next_count;

  return next_count;
end;
$$;

revoke all on function public.increment_post_claps(text, integer) from public, anon, authenticated;
grant execute on function public.increment_post_claps(text, integer) to service_role;
