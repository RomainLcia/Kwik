-- ============================================================
-- KWIK — Schéma Supabase complet
-- À exécuter dans Supabase > SQL Editor > New query
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: companies (profil entreprise)
-- ============================================================
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  siret text,
  legal_form text default 'micro-entreprise',
  vat_applicable boolean default false,
  vat_number text,
  address_street text,
  address_zip text,
  address_city text,
  phone text,
  contact_email text,
  logo_url text,
  iban text,
  quote_prefix text default 'DEV',
  invoice_prefix text default 'FAC',
  quote_counter integer default 0,
  invoice_counter integer default 0,
  legal_mentions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLE: clients
-- ============================================================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade not null,
  client_type text default 'particulier' check (client_type in ('particulier', 'professionnel')),
  name text not null,
  email text,
  phone text,
  address_street text,
  address_zip text,
  address_city text,
  vat_number text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLE: catalog_items (catalogue de prestations)
-- ============================================================
create table public.catalog_items (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade not null,
  label text not null,
  description text,
  default_price_ht numeric(10,2) default 0,
  default_unit text default 'unité' check (default_unit in ('unité', 'heure', 'jour', 'm²', 'ml', 'forfait', 'autre')),
  default_vat_rate numeric(5,2) default 20,
  category text,
  archived_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLE: quotes (devis)
-- ============================================================
create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  number text not null,
  object text,
  issue_date date default current_date,
  validity_date date default (current_date + interval '30 days'),
  status text default 'draft' check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  sent_at timestamptz,
  viewed_at timestamptz,
  responded_at timestamptz,
  subtotal_ht numeric(10,2) default 0,
  discount_amount numeric(10,2) default 0,
  discount_percent numeric(5,2) default 0,
  total_ht numeric(10,2) default 0,
  total_vat numeric(10,2) default 0,
  total_ttc numeric(10,2) default 0,
  deposit_amount numeric(10,2),
  deposit_percent numeric(5,2),
  notes text,
  terms text,
  public_token text unique default encode(gen_random_bytes(32), 'hex'),
  signature_data jsonb,
  pdf_url text,
  signed_pdf_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLE: quote_lines (lignes de devis)
-- ============================================================
create table public.quote_lines (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references public.quotes(id) on delete cascade not null,
  position integer default 0,
  label text not null,
  description text,
  quantity numeric(10,3) default 1,
  unit text default 'unité',
  price_ht numeric(10,2) default 0,
  vat_rate numeric(5,2) default 20,
  line_total_ht numeric(10,2) default 0,
  line_total_ttc numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE: invoices (factures)
-- ============================================================
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  number text not null,
  object text,
  issue_date date default current_date,
  due_date date default (current_date + interval '30 days'),
  service_date date,
  status text default 'draft' check (status in ('draft', 'sent', 'viewed')),
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  sent_at timestamptz,
  paid_at timestamptz,
  payment_method text,
  subtotal_ht numeric(10,2) default 0,
  discount_amount numeric(10,2) default 0,
  discount_percent numeric(5,2) default 0,
  total_ht numeric(10,2) default 0,
  total_vat numeric(10,2) default 0,
  total_ttc numeric(10,2) default 0,
  notes text,
  terms text,
  public_token text unique default encode(gen_random_bytes(32), 'hex'),
  pdf_url text,
  is_deposit boolean default false,
  deposit_percent numeric(5,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLE: invoice_lines (lignes de facture)
-- ============================================================
create table public.invoice_lines (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  position integer default 0,
  label text not null,
  description text,
  quantity numeric(10,3) default 1,
  unit text default 'unité',
  price_ht numeric(10,2) default 0,
  vat_rate numeric(5,2) default 20,
  line_total_ht numeric(10,2) default 0,
  line_total_ttc numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE: events (audit trail)
-- ============================================================
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade not null,
  entity_type text not null check (entity_type in ('quote', 'invoice', 'client')),
  entity_id uuid not null,
  event_type text not null check (event_type in ('created', 'updated', 'sent', 'viewed', 'signed', 'rejected', 'converted', 'paid')),
  metadata jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.companies enable row level security;
alter table public.clients enable row level security;
alter table public.catalog_items enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_lines enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.events enable row level security;

-- Companies : l'utilisateur ne voit que sa propre entreprise
create policy "companies: user owns row" on public.companies
  for all using (auth.uid() = user_id);

-- Clients : l'utilisateur ne voit que les clients de sa company
create policy "clients: company isolation" on public.clients
  for all using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

-- Catalog items
create policy "catalog_items: company isolation" on public.catalog_items
  for all using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

-- Quotes
create policy "quotes: company isolation" on public.quotes
  for all using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

-- Quote lines (accès via le devis parent)
create policy "quote_lines: via quote" on public.quote_lines
  for all using (
    quote_id in (
      select q.id from public.quotes q
      join public.companies c on c.id = q.company_id
      where c.user_id = auth.uid()
    )
  );

-- Invoices
create policy "invoices: company isolation" on public.invoices
  for all using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

-- Invoice lines
create policy "invoice_lines: via invoice" on public.invoice_lines
  for all using (
    invoice_id in (
      select i.id from public.invoices i
      join public.companies c on c.id = i.company_id
      where c.user_id = auth.uid()
    )
  );

-- Events
create policy "events: company isolation" on public.events
  for all using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

-- Politique publique pour la page de signature (lecture seule via token)
create policy "quotes: public read via token" on public.quotes
  for select using (public_token is not null);

create policy "invoices: public read via token" on public.invoices
  for select using (public_token is not null);

-- ============================================================
-- INDEXES pour les performances
-- ============================================================
create index on public.clients(company_id);
create index on public.catalog_items(company_id);
create index on public.quotes(company_id);
create index on public.quotes(status);
create index on public.quotes(public_token);
create index on public.invoices(company_id);
create index on public.invoices(public_token);
create index on public.quote_lines(quote_id);
create index on public.invoice_lines(invoice_id);
create index on public.events(entity_id);

-- ============================================================
-- FONCTION : mise à jour automatique de updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.companies
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.clients
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.catalog_items
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.quotes
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.invoices
  for each row execute function public.handle_updated_at();
