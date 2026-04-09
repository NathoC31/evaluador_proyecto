# Evaluación de Stands

App para que los padres evalúen stands escolares escaneando QR.

## Estructura

```
evaluacion-stands/
├── app/
│   ├── page.js          # Página pública - escanear QR y evaluar
│   ├── admin/page.js    # Panel de admin (solo superadmin)
│   ├── globals.css
│   └── layout.js
├── components/
│   └── QrScanner.js      # Scanner QR nativo
├── lib/
│   ├── config.js        # Config Supabase
│   └── supabase.js      # Cliente Supabase
└── sql/
    └── schema.sql       # Schema base de datos
```

## Setup

1. **Crear proyecto en Supabase** y obtener URL y anon key

2. **Ejecutar SQL** en el Editor SQL de Supabase (archivo `sql/schema.sql`)

3. **Copiar variables** a `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

4. **Instalar dependencias**:
   ```bash
   cd evaluacion-stands
   npm install
   ```

5. **Ejecutar**:
   ```bash
   npm run dev
   ```

## Uso

- **Padres**: Ir a la URL, escanear QR del stand, dar estrellas (1-5), opcional comentario
- **Admin**: `/admin` - crear/editar stands, ver evaluaciones, resumen/ranking

## Desplegar en Vercel

1. Importar proyecto en vercel.com
2. Agregar variables de entorno
3. Deploy automático