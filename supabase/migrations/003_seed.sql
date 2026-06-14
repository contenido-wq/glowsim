INSERT INTO business_types (id, name, slug, face_map_type) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Clínica Estética', 'clinica', 'face'),
  ('22222222-2222-2222-2222-222222222222', 'Barbería', 'barberia', 'hair'),
  ('33333333-3333-3333-3333-333333333333', 'Spa de Uñas', 'spa_unas', 'hands'),
  ('44444444-4444-4444-4444-444444444444', 'Micropigmentación', 'micropigmentacion', 'brows');

-- Zonas: face (9 zonas)
INSERT INTO procedure_zones (business_type_id, name, svg_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Frente', 'frente'),
  ('11111111-1111-1111-1111-111111111111', 'Ojo Izquierdo', 'ojos_izq'),
  ('11111111-1111-1111-1111-111111111111', 'Ojo Derecho', 'ojos_der'),
  ('11111111-1111-1111-1111-111111111111', 'Nariz', 'nariz'),
  ('11111111-1111-1111-1111-111111111111', 'Labios', 'labios'),
  ('11111111-1111-1111-1111-111111111111', 'Mejilla Izquierda', 'mejilla_izq'),
  ('11111111-1111-1111-1111-111111111111', 'Mejilla Derecha', 'mejilla_der'),
  ('11111111-1111-1111-1111-111111111111', 'Mentón', 'menton'),
  ('11111111-1111-1111-1111-111111111111', 'Cuello', 'cuello');

-- Zonas: hair (6 zonas)
INSERT INTO procedure_zones (business_type_id, name, svg_id) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Parte Superior', 'parte_superior'),
  ('22222222-2222-2222-2222-222222222222', 'Lado Izquierdo', 'lado_izq'),
  ('22222222-2222-2222-2222-222222222222', 'Lado Derecho', 'lado_der'),
  ('22222222-2222-2222-2222-222222222222', 'Nuca', 'nuca'),
  ('22222222-2222-2222-2222-222222222222', 'Barba', 'barba'),
  ('22222222-2222-2222-2222-222222222222', 'Patillas', 'patillas');

-- Zonas: hands (3 zonas)
INSERT INTO procedure_zones (business_type_id, name, svg_id) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Uñas', 'unas'),
  ('33333333-3333-3333-3333-333333333333', 'Cutículas', 'cuticulas'),
  ('33333333-3333-3333-3333-333333333333', 'Dorso', 'dorso');

-- Zonas: brows (4 zonas)
INSERT INTO procedure_zones (business_type_id, name, svg_id) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Ceja Izquierda', 'ceja_izq'),
  ('44444444-4444-4444-4444-444444444444', 'Ceja Derecha', 'ceja_der'),
  ('44444444-4444-4444-4444-444444444444', 'Labio Superior', 'labio_superior'),
  ('44444444-4444-4444-4444-444444444444', 'Labio Inferior', 'labio_inferior');
