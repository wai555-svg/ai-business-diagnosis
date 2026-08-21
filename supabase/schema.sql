-- AI業務改善診断: 無料相談リード保存用テーブル
-- Supabaseダッシュボードの「SQL Editor」に貼り付けてそのまま実行してください。

create extension if not exists "pgcrypto"; -- gen_random_uuid() を使うため

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  company_name text not null,
  name text not null,
  email text not null,
  message text,

  -- 診断結果のサマリー（診断未実施のまま相談された場合はすべてnull）
  annual_saved_hours integer,
  annual_saved_cost integer,
  ai_recommendation integer,
  top_tasks text[],

  -- 流入元（Instagram広告等のUTMパラメータ）
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Row Level Securityを有効化し、ポリシーは一切追加しない。
-- これにより anon / authenticated キー経由のアクセスはすべて拒否され、
-- サーバー側のService Role Key（RLSをバイパスする）からのみ読み書きできる状態になる。
alter table public.leads enable row level security;
