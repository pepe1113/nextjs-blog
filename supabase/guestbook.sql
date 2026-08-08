drop function if exists public.create_post_comment(text, uuid, text, text, text, text);
drop table if exists public.post_comments;

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.guestbook_entries(id) on delete cascade,
  author_name text not null check (length(btrim(author_name)) between 1 and 80),
  author_email text check (author_email is null or length(author_email) <= 254),
  content text not null check (length(btrim(content)) between 1 and 2000),
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

alter table public.guestbook_entries
alter column author_email drop not null;

create index if not exists guestbook_entries_parent_id_idx
on public.guestbook_entries (parent_id);

create index if not exists guestbook_entries_ip_hash_created_at_idx
on public.guestbook_entries (ip_hash, created_at desc);

alter table public.guestbook_entries enable row level security;

drop policy if exists "Service role can manage guestbook entries" on public.guestbook_entries;
create policy "Service role can manage guestbook entries"
on public.guestbook_entries
for all
to service_role
using (true)
with check (true);

revoke all on table public.guestbook_entries from anon, authenticated;
grant select, insert on table public.guestbook_entries to service_role;

create or replace function public.create_guestbook_entry(
  p_parent_id uuid,
  p_author_name text,
  p_author_email text,
  p_content text,
  p_ip_hash text
)
returns table (
  entry_id uuid,
  entry_created_at timestamptz,
  parent_author_name text,
  parent_author_email text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_entry_id uuid;
  new_entry_created_at timestamptz;
  reply_author_name text;
  reply_author_email text;
begin
  if p_author_name is null
    or length(btrim(p_author_name)) not between 1 and 80
    or p_author_name ~ '[\r\n]' then
    raise exception 'Invalid author name';
  end if;

  if nullif(btrim(p_author_email), '') is not null
    and (
      length(btrim(p_author_email)) > 254
      or btrim(p_author_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ) then
    raise exception 'Invalid author email';
  end if;

  if p_content is null or length(btrim(p_content)) not between 1 and 2000 then
    raise exception 'Invalid guestbook content';
  end if;

  if p_ip_hash is null or p_ip_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid request fingerprint';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));

  if (
    select count(*)
    from public.guestbook_entries
    where ip_hash = p_ip_hash
      and created_at > now() - interval '10 minutes'
  ) >= 5 then
    raise exception 'Too many guestbook entries';
  end if;

  if p_parent_id is not null then
    select author_name, author_email
    into reply_author_name, reply_author_email
    from public.guestbook_entries
    where id = p_parent_id;

    if not found then
      raise exception 'Invalid parent entry';
    end if;
  end if;

  insert into public.guestbook_entries (parent_id, author_name, author_email, content, ip_hash)
  values (
    p_parent_id,
    btrim(p_author_name),
    lower(nullif(btrim(p_author_email), '')),
    btrim(p_content),
    p_ip_hash
  )
  returning id, created_at into new_entry_id, new_entry_created_at;

  return query
  select new_entry_id, new_entry_created_at, reply_author_name, reply_author_email;
end;
$$;

revoke all on function public.create_guestbook_entry(uuid, text, text, text, text)
from public, anon, authenticated;
grant execute on function public.create_guestbook_entry(uuid, text, text, text, text)
to service_role;
