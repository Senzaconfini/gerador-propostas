-- Gerador de Propostas — Schema Supabase
-- Execute em: Supabase Dashboard > SQL Editor

-- Configuração da agência (base de conhecimento)
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

-- Serviços da agência
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
  conversa text default '',          -- histórico WhatsApp colado/puxado
  reuniao text default '',           -- ata de reunião (texto extraído)
  audio_transcrito text default '',  -- áudio transcrito (via UAZAPI)
  notas_extras text default '',      -- qualquer nota adicional
  updated_at timestamptz default now()
);

-- Propostas geradas
create table if not exists propostas (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  html text not null,                -- HTML completo da proposta
  enviada boolean default false,
  enviada_em timestamptz,
  created_at timestamptz default now()
);

-- Inserir config inicial vazia
insert into config (agencia_nome) values ('') on conflict do nothing;

-- RLS desativado para simplicidade (habilitar em produção com auth)
alter table config enable row level security;
alter table servicos enable row level security;
alter table leads enable row level security;
alter table lead_contexto enable row level security;
alter table propostas enable row level security;

-- Policies abertas (ajustar quando adicionar autenticação)
create policy "allow all" on config for all using (true) with check (true);
create policy "allow all" on servicos for all using (true) with check (true);
create policy "allow all" on leads for all using (true) with check (true);
create policy "allow all" on lead_contexto for all using (true) with check (true);
create policy "allow all" on propostas for all using (true) with check (true);
