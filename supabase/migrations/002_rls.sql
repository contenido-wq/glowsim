ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_log ENABLE ROW LEVEL SECURITY;

-- Helper: obtener business_id del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS uuid AS $$
  SELECT business_id FROM business_users
  WHERE user_id = auth.uid()
  LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: verificar si es superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean AS $$
  SELECT auth.jwt() ->> 'email' = current_setting('app.superadmin_email', true)
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- business_types: lectura pública
CREATE POLICY "public read business_types" ON business_types FOR SELECT USING (true);
CREATE POLICY "superadmin write business_types" ON business_types FOR ALL USING (is_superadmin());

-- businesses: lectura pública (para middleware), admin edita el suyo
CREATE POLICY "public read businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "admin update own business" ON businesses
  FOR UPDATE USING (id = get_user_business_id() OR is_superadmin());
CREATE POLICY "superadmin insert business" ON businesses FOR INSERT WITH CHECK (is_superadmin());

-- business_users: solo superadmin gestiona
CREATE POLICY "superadmin all business_users" ON business_users FOR ALL USING (is_superadmin());
CREATE POLICY "admin read own record" ON business_users FOR SELECT USING (user_id = auth.uid());

-- procedure_zones: lectura pública
CREATE POLICY "public read procedure_zones" ON procedure_zones FOR SELECT USING (true);
CREATE POLICY "superadmin write procedure_zones" ON procedure_zones FOR ALL USING (is_superadmin());

-- procedures: lectura pública de activas, admin gestiona las suyas
CREATE POLICY "public read active procedures" ON procedures FOR SELECT USING (is_active = true);
CREATE POLICY "admin manage own procedures" ON procedures
  FOR ALL USING (business_id = get_user_business_id() OR is_superadmin());

-- sessions_log: INSERT anónimo público, SELECT solo admin del negocio o superadmin
CREATE POLICY "public insert sessions_log" ON sessions_log FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read own sessions_log" ON sessions_log
  FOR SELECT USING (business_id = get_user_business_id() OR is_superadmin());
