-- Tabla de stands
CREATE TABLE IF NOT EXISTS stands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  categoria TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Tabla de evaluaciones
CREATE TABLE IF NOT EXISTS evaluaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stand_id UUID REFERENCES stands(id) ON DELETE CASCADE,
  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de admins (solo 1 superadmin)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  rol TEXT DEFAULT 'admin',
  puede_verificar BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Políticas para stands (público lectura, admin escritura)
CREATE POLICY "Public read stands" ON stands FOR SELECT USING (true);
CREATE POLICY "Admin manage stands" ON stands FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE usuario_id = auth.uid() AND rol = 'superadmin' AND activo = true)
);

-- Políticas para evaluaciones (público insert, admin todo)
CREATE POLICY "Public insert evaluations" ON evaluaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read evaluations" ON evaluaciones FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE usuario_id = auth.uid() AND activo = true)
);
CREATE POLICY "Admin delete evaluations" ON evaluaciones FOR DELETE USING (
  EXISTS (SELECT 1 FROM admins WHERE usuario_id = auth.uid() AND rol = 'superadmin' AND activo = true)
);

-- Políticas para admins
CREATE POLICY "Admins manage themselves" ON admins FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE usuario_id = auth.uid() AND rol = 'superadmin' AND activo = true)
);

-- Agregar stand inicial
INSERT INTO stands (nombre, categoria) VALUES 
  ('Stand de Ciencias', 'Ciencia'),
  ('Stand de Arte', 'Arte'),
  ('Stand de Música', 'Música')
ON CONFLICT (nombre) DO NOTHING;