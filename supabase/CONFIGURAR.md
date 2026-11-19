# Conectar el backend (Supabase)

El sitio ya usa el proyecto de Supabase que está en `assets/js/config.js`. Solo faltan estos pasos en el panel de Supabase.

## 1. Crear las tablas
Supabase → **SQL Editor** → New query → pegar todo `supabase/schema.sql` → **Run**.
Crea `profiles` y `resultados`, con seguridad por fila: cada persona ve solo sus datos.

## 2. Direcciones del sitio (para los correos)
Supabase → **Authentication → URL Configuration**
- **Site URL**: la dirección donde está publicado el sitio, por ejemplo `https://royluis1.github.io/TEM-/`
- **Redirect URLs**: agregar `https://royluis1.github.io/TEM-/ingresar.html`
  (y `http://localhost:5500/ingresar.html` si lo probás en tu compu con Live Server)

Sin esto, los enlaces de "confirmar cuenta" y "recuperar contraseña" no vuelven al sitio.

## 3. Ingreso por correo
Supabase → **Authentication → Sign In / Providers → Email**: activado, con **Confirm email** encendido.
Contraseña mínima: 8 (coincide con el formulario).

## 4. Probar
1. Abrí `ingresar.html` → Crear cuenta → confirmá desde el correo.
2. Hacé la evaluación de un nivel → "Guardar mi resultado".
3. Volvé a "Ingresar": tiene que aparecer en la tabla.
4. En Supabase → **Table Editor → resultados** vas a ver la fila.

## Notas
- La clave de `config.js` es la *publishable* (pública): está bien que esté en el front. Nunca pongas ahí la `service_role` / secret key.
- `API_URL` en `config.js` no se usa; podés dejarlo vacío.
- El correo gratuito de Supabase manda pocos mails por hora. Si van a registrarse muchas personas juntas en la cursada, conviene configurar un SMTP propio en Authentication → SMTP Settings.
