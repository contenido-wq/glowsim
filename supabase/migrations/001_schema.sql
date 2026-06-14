-- business_types: Seed data, no editable por usuarios
CREATE TABLE business_types (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  face_map_type text NOT NULL CHECK (face_map_type IN ('face', 'hair', 'hands', 'brows')),
  created_at    timestamptz DEFAULT now()
);

-- businesses: El tenant central
CREATE TABLE businesses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type_id  uuid REFERENCES business_types(id),
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  custom_domain     text UNIQUE,
  logo_url          text,
  primary_color     text NOT NULL DEFAULT '#6366f1',
  secondary_color   text NOT NULL DEFAULT '#a855f7',
  tagline           text,
  whatsapp_number   text NOT NULL,
  whatsapp_message  text,
  city              text,
  country           text,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- business_users: Admins vinculados a un negocio
CREATE TABLE business_users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id  uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  role         text NOT NULL DEFAULT 'admin',
  created_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- procedure_zones: Zonas del FaceMap por tipo de negocio
CREATE TABLE procedure_zones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type_id  uuid REFERENCES business_types(id) ON DELETE CASCADE NOT NULL,
  name              text NOT NULL,
  svg_id            text NOT NULL,
  created_at        timestamptz DEFAULT now()
);

-- procedures: Procedimientos configurados por cada negocio
CREATE TABLE procedures (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  zone_id     uuid REFERENCES procedure_zones(id),
  name        text NOT NULL,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- sessions_log: Eventos anónimos para analytics
CREATE TABLE sessions_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  session_id   text NOT NULL,
  event_type   text NOT NULL CHECK (event_type IN ('visit', 'simulation_start', 'simulation_complete', 'whatsapp_click')),
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_term     text,
  utm_content  text,
  metadata     jsonb,
  created_at   timestamptz DEFAULT now()
);

-- Índices de performance
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_custom_domain ON businesses(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_sessions_log_business_id ON sessions_log(business_id);
CREATE INDEX idx_sessions_log_created_at ON sessions_log(created_at);
CREATE INDEX idx_procedures_business_id ON procedures(business_id);
CREATE INDEX idx_business_users_user_id ON business_users(user_id);
