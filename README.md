# TEM — Plan de Formación en Tecnología Móvil

Sitio web educativo del Plan de Formación en Tecnología Móvil de la Universidad Nacional de Villa Mercedes y la Municipalidad de Justo Daract.

TEM ayuda a vecinos y vecinas de Justo Daract a usar el celular con más seguridad y práctica para realizar trámites, proteger sus datos y desarrollar actividades comerciales.

## Para quién es

- Personas de 16 a 65 años que quieren aprender desde lo básico.
- Vecinos que necesitan realizar trámites digitales.
- Comerciantes y proveedores que desean comunicar y vender desde el celular.
- Estudiantes que participan en cursadas acompañadas por docentes.

## Cursos

- **Cuidate Online:** seguridad, prevención de estafas y protección de datos personales.
- **Herramientas digitales para comercios:** Canva, redes sociales y edición de videos con CapCut.

## Características

- Diseño adaptable para celulares y computadoras.
- Navegación y formularios accesibles.
- Registro e inicio de sesión.
- Recuperación y cambio de contraseña.
- Perfil personal y selección de grupo.
- Evaluaciones con puntaje y explicaciones.
- Guardado y descarga de resultados.
- Eliminación de cuenta.
- Versión instalable como PWA.

## Tecnologías

- HTML5.
- CSS3.
- JavaScript.
- Supabase.
- Service Worker y Web App Manifest.

El proyecto no requiere compilación ni gestores de paquetes.

## Ejecutar localmente

Desde la carpeta del proyecto:

```powershell
python -m http.server 4173
```

Luego abrir `http://localhost:4173`.

También puede utilizarse cualquier servidor web estático.

## Configuración

La conexión con Supabase se configura en `assets/js/config.js`.

Las migraciones de la base de datos están disponibles en `supabase/migracion-2.sql`. La ejecución y administración deben realizarse desde el panel de Supabase por una persona responsable del proyecto.

## Estructura

```text
assets/       Recursos visuales, estilos y JavaScript
cursos/       Contenido de los cursos
docs/         Documentación técnica
plan/         Información sobre el plan TEM
supabase/     Migraciones de la base de datos
index.html    Página principal
ingresar.html Ingreso y registro
perfil.html   Perfil y progreso
privacidad.html
manifest.json Manifiesto PWA
sw.js         Service Worker
```

## Despliegue

Puede publicarse en Vercel, GitHub Pages o cualquier hosting de archivos estáticos.

Antes de publicar, se debe confirmar la configuración del proyecto, ejecutar las migraciones necesarias y probar ingreso, registro, evaluaciones y perfil desde un dispositivo móvil.

## Privacidad

TEM guarda únicamente la información necesaria para la cuenta, el perfil y los resultados de las evaluaciones. Los detalles sobre datos recopilados y eliminación de cuentas se explican en la página de privacidad del sitio.
