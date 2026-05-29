create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  created_by text not null
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category_id uuid references public.categories(id) on delete set null,
  category_name text not null,
  tags text[] not null default '{}',
  uploader_name text not null,
  uploaded_at timestamptz not null default now(),
  source_url text,
  answer text,
  answer_author text,
  answered_at timestamptz,
  constraint answer_author_required check (
    answer is null or (answer_author is not null and answered_at is not null)
  )
);

create table if not exists public.invite_tokens (
  token text primary key,
  passcode_hash text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.questions enable row level security;
alter table public.invite_tokens enable row level security;

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
  on public.categories for select
  using (true);

drop policy if exists "Public read questions" on public.questions;
create policy "Public read questions"
  on public.questions for select
  using (true);

create or replace function public.valid_invite(p_token text, p_passcode text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.invite_tokens
    where token = p_token
      and enabled = true
      and passcode_hash = crypt(p_passcode, passcode_hash)
  );
$$;

create or replace function public.create_question_with_invite(
  invite_token text,
  passcode text,
  uploader_name text,
  title text,
  body text,
  category_name text,
  tags text[] default '{}',
  source_url text default null,
  answer text default null
)
returns setof public.questions
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_category text;
  category_row public.categories;
  new_question public.questions;
begin
  if not public.valid_invite(invite_token, passcode) then
    raise exception '邀请链接或口令无效';
  end if;

  clean_category := nullif(trim(create_question_with_invite.category_name), '');
  if clean_category is null then
    raise exception '分类不能为空';
  end if;

  insert into public.categories (name, created_by)
  values (clean_category, trim(create_question_with_invite.uploader_name))
  on conflict (name) do update set name = excluded.name
  returning * into category_row;

  insert into public.questions (
    title,
    body,
    category_id,
    category_name,
    tags,
    uploader_name,
    source_url,
    answer,
    answer_author,
    answered_at
  )
  values (
    trim(create_question_with_invite.title),
    trim(create_question_with_invite.body),
    category_row.id,
    category_row.name,
    coalesce(create_question_with_invite.tags, '{}'),
    trim(create_question_with_invite.uploader_name),
    nullif(trim(create_question_with_invite.source_url), ''),
    nullif(trim(create_question_with_invite.answer), ''),
    case when nullif(trim(create_question_with_invite.answer), '') is null then null else trim(create_question_with_invite.uploader_name) end,
    case when nullif(trim(create_question_with_invite.answer), '') is null then null else now() end
  )
  returning * into new_question;

  return next new_question;
end;
$$;

create or replace function public.answer_question_with_invite(
  invite_token text,
  passcode text,
  question_id uuid,
  answer_author text,
  answer text
)
returns setof public.questions
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_question public.questions;
begin
  if not public.valid_invite(invite_token, passcode) then
    raise exception '邀请链接或口令无效';
  end if;

  update public.questions
  set
    answer = trim(answer_question_with_invite.answer),
    answer_author = trim(answer_question_with_invite.answer_author),
    answered_at = now()
  where id = answer_question_with_invite.question_id
    and public.questions.answer is null
  returning * into updated_question;

  if updated_question.id is null then
    raise exception '题目不存在或已有答案';
  end if;

  return next updated_question;
end;
$$;

create or replace function public.update_question_with_invite(
  invite_token text,
  passcode text,
  question_id uuid,
  editor_name text,
  title text,
  body text,
  category_name text,
  tags text[] default '{}',
  source_url text default null,
  answer text default null
)
returns setof public.questions
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_category text;
  category_row public.categories;
  updated_question public.questions;
begin
  if not public.valid_invite(invite_token, passcode) then
    raise exception '邀请链接或口令无效';
  end if;

  if nullif(trim(update_question_with_invite.title), '') is null
    or nullif(trim(update_question_with_invite.body), '') is null then
    raise exception '题目不能为空';
  end if;

  clean_category := nullif(trim(update_question_with_invite.category_name), '');
  if clean_category is null then
    raise exception '分类不能为空';
  end if;

  insert into public.categories (name, created_by)
  values (clean_category, trim(update_question_with_invite.editor_name))
  on conflict (name) do update set name = excluded.name
  returning * into category_row;

  update public.questions
  set
    title = trim(update_question_with_invite.title),
    body = trim(update_question_with_invite.body),
    category_id = category_row.id,
    category_name = category_row.name,
    tags = coalesce(update_question_with_invite.tags, '{}'),
    source_url = nullif(trim(update_question_with_invite.source_url), ''),
    answer = nullif(trim(update_question_with_invite.answer), ''),
    answer_author = case
      when nullif(trim(update_question_with_invite.answer), '') is null then null
      else trim(update_question_with_invite.editor_name)
    end,
    answered_at = case
      when nullif(trim(update_question_with_invite.answer), '') is null then null
      else now()
    end
  where id = update_question_with_invite.question_id
  returning * into updated_question;

  if updated_question.id is null then
    raise exception '题目不存在';
  end if;

  return next updated_question;
end;
$$;

grant usage on schema public to anon;
grant select on public.categories to anon;
grant select on public.questions to anon;
grant execute on function public.create_question_with_invite(text, text, text, text, text, text, text[], text, text) to anon;
grant execute on function public.answer_question_with_invite(text, text, uuid, text, text) to anon;
grant execute on function public.update_question_with_invite(text, text, uuid, text, text, text, text, text[], text, text) to anon;

-- 创建邀请示例：
-- insert into public.invite_tokens (token, passcode_hash)
-- values ('your-invite-token', crypt('your-passcode', gen_salt('bf')));
