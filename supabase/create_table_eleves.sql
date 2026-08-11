create table eleves (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  nom text not null,
  prenom text not null,
  sexe text not null check (sexe in ('Fille', 'Garcon')),
  date_naissance date not null,
  niveau text not null,
  assurance_scolaire boolean not null default false,
  montant_cooperative numeric not null default 0
);

alter table eleves enable row level security;

create policy "Acces complet pour utilisateurs authentifies"
on eleves for all
using (true)
with check (true);
