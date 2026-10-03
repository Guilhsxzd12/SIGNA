-- Estrutura inicial para a próxima etapa de integração com Supabase.
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category text,
  unit text default 'UN',
  cost numeric(12,2) not null default 0,
  stock numeric(12,3) not null default 0,
  min_stock numeric(12,3) not null default 0,
  margin numeric(6,2),
  packaging_cost numeric(12,2),
  extra_cost numeric(12,2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client_id uuid references clients(id),
  payment text not null,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'paid',
  type text not null default 'sale',
  created_at timestamptz not null default now()
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) on delete cascade,
  product_id uuid references products(id),
  name text not null,
  qty numeric(12,3) not null,
  unit_price numeric(12,2) not null,
  unit_cost numeric(12,2) not null
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  due_date date not null,
  value numeric(12,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists service_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client_name text not null,
  description text not null,
  value numeric(12,2) not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
