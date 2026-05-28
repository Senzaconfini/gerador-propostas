-- Gerador de Propostas — Schema Supabase
-- Execute em: Supabase Dashboard > SQL Editor

-- Configuração da empresa (base de conhecimento)
create table if not exists config (
  id uuid primary key default gen_random_uuid(),
  agencia_nome text not null default '',
  agencia_descricao text not null default '',
  agencia_diferenciais text not null default '',
  tom_de_voz text not null default '',
  mensagem_padrao text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Serviços da empresa
create table if not exists servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text not null default '',
  preco text not null,
  unidade text not null default 'mês',
  ordem int default 0,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  empresa text not null default '',
  whatsapp text not null default '',
  nicho text not null default '',
  status text not null default 'novo',
  -- status: novo | proposta_gerada | proposta_enviada
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contexto de cada lead (conversa + reunião)
create table if not exists lead_contexto (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  conversa text default '',
  reuniao text default '',
  audio_transcrito text default '',
  notas_extras text default '',
  updated_at timestamptz default now()
);

-- Propostas geradas
create table if not exists propostas (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  html text not null,
  enviada boolean default false,
  enviada_em timestamptz,
  created_at timestamptz default now()
);

-- Inserir config inicial vazia
insert into config (agencia_nome) values ('') on conflict do nothing;

-- ─────────────────────────────────────────────────────────
-- SEGURANÇA: RLS bloqueando acesso direto pela anon key
-- O app acessa o banco apenas via API routes do Next.js
-- usando a SERVICE_ROLE_KEY (nunca exposta no browser)
-- ─────────────────────────────────────────────────────────
alter table config enable row level security;
alter table servicos enable row level security;
alter table leads enable row level security;
alter table lead_contexto enable row level security;
alter table propostas enable row level security;

-- Bloqueia tudo para a anon key (acesso direto pelo browser)
drop policy if exists "deny anon" on config;
drop policy if exists "deny anon" on servicos;
drop policy if exists "deny anon" on leads;
drop policy if exists "deny anon" on lead_contexto;
drop policy if exists "deny anon" on propostas;

create policy "deny anon" on config for all to anon using (false);
create policy "deny anon" on servicos for all to anon using (false);
create policy "deny anon" on leads for all to anon using (false);
create policy "deny anon" on lead_contexto for all to anon using (false);
create policy "deny anon" on propostas for all to anon using (false);

-- Permite tudo para o service_role (usado pelo servidor Next.js)
drop policy if exists "allow service" on config;
drop policy if exists "allow service" on servicos;
drop policy if exists "allow service" on leads;
drop policy if exists "allow service" on lead_contexto;
drop policy if exists "allow service" on propostas;

create policy "allow service" on config for all to service_role using (true) with check (true);
create policy "allow service" on servicos for all to service_role using (true) with check (true);
create policy "allow service" on leads for all to service_role using (true) with check (true);
create policy "allow service" on lead_contexto for all to service_role using (true) with check (true);
create policy "allow service" on propostas for all to service_role using (true) with check (true);
