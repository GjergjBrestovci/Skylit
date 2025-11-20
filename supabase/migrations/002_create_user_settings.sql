create extension if not exists "pgcrypto";

create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  display_name text,
  theme_preference text not null default 'system',
  notification_product_updates boolean not null default true,
  notification_weekly_summary boolean not null default false,
  notification_ai_launches boolean not null default true,
  autosave_interval integer not null default 5,
  show_beta_features boolean not null default false,
  api_mirroring_enabled boolean not null default false,
  webhook_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_settings_user_id_key on user_settings(user_id);

drop trigger if exists user_settings_updated_at on user_settings;

drop function if exists set_user_settings_updated_at cascade;

create function set_user_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_settings_updated_at
before update on user_settings
for each row
execute function set_user_settings_updated_at();
