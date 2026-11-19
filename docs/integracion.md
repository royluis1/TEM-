# Integración con Persona 2 (PWA / panel docente) y Persona 3 (evaluación)

## 1. Resultados por pregunta — formato a acordar con Persona 3

Cada resultado guardado (`public.resultados`) trae:

| columna   | tipo   | detalle |
|-----------|--------|---------|
| nivel     | text   | `nivel-1`, `nivel-2`, `nivel-3` |
| puntaje   | int    | la base lo recalcula desde `detalle` |
| total     | int    | la base lo recalcula desde `detalle` |
| detalle   | jsonb  | lista, una entrada por pregunta |
| created_at| fecha  | automática |

`detalle`: `[{"id":"nivel-1:3","ok":true}, {"id":"nivel-1:4","ok":false}, ...]`
- `id`: texto que identifica la pregunta. `ok`: true si acertó.
- Máximo 50 preguntas por evaluación.

**Qué hay que acordar (Persona 3):**
1. **IDs estables.** Hoy, si la pregunta no tiene `id`, el sitio usa su posición (`nivel-1:3`). Si se reordenan o se borran preguntas, las estadísticas viejas dejan de coincidir.
2. **Formato objeto (propuesto).** Cada pregunta con id propio. El motor del sitio ya lo lee, y sigue leyendo el formato actual:
   `{"id":"n1-camara-01","t":"texto de la pregunta","c":0,"e":"explicación","o":["opción A","opción B","opción C"]}`
   - `c` = posición de la opción correcta dentro de `o` (0 = la primera).
   - Para verdadero/falso (sin `o`): `c` = 1 si es estafa, 0 si es seguro.
3. **Nunca reutilizar un `id` para otra pregunta.** Si una pregunta cambia de sentido, darle un id nuevo.

## 2. Panel docente — para Persona 2

- Rol: la columna `profiles.rol` vale `alumno` (por defecto) o `docente`. Solo se cambia desde el SQL Editor de Supabase; el sitio no puede modificarla.
- Llamada (misma URL y misma anon key del sitio; la persona tiene que haber ingresado con su cuenta de docente):

```js
const { data, error } = await supabase.rpc('panel_docente');
// error.code === '42501' si quien pide no es docente
```

- Devuelve una fila por alumno y por resultado (un alumno sin resultados aparece con `nivel`, `puntaje`, `total`, `detalle` y `fecha` en null):
  `alumno_id, nombre, grupo, nivel, puntaje, total, detalle, fecha`
- **No incluye correos.** Y solo funciona si quien pide es docente: la verificación se hace en la base de datos, no en el navegador.
- Para agrupar por alumno usar `alumno_id`.
