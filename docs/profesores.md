# Gestión de Usuarios (Solo Profesores)

Esta sección describe el flujo completo del profesor: desde inscribir estudiantes hasta monitorear sus despliegues y limpiar al final del semestre.

---

## Paso 1 — Inscribir estudiantes en la plataforma

Antes de que un estudiante pueda usar Kubero, el profesor debe crearle una cuenta.

1. Accede a `https://kubero.inf.uct.cl` con tu usuario de profesor
2. Ve a **"Settings"** → **"Users"**
3. Haz clic en **"Add User"**
4. Completa los datos:

   | Campo | Qué ingresar |
   |---|---|
   | **Username** | Nombre de usuario del estudiante (ej: `jperez`) |
   | **Password** | Contraseña inicial (el estudiante la puede cambiar después) |
   | **Role** | `Developer` |

5. Haz clic en **"Save"**
6. Entrega al estudiante su usuario y contraseña para que acceda a `https://kubero.inf.uct.cl`

![Pantalla de gestión de usuarios con lista y botón Create User](imagenes/23-gestion-usuarios.png)

![Formulario de creación de usuario con datos de ejemplo](imagenes/24-formulario-usuario.png)

> **Roles disponibles:**
> - **Developer** → puede crear pipelines, apps, ver logs y hacer despliegues. Asigna este rol a los estudiantes.
> - **Viewer** → solo puede ver el estado de los proyectos, sin modificar nada. Útil si quieres que alguien revise sin intervenir.

---

## Paso 2 — El estudiante trabaja de forma autónoma

Una vez que el estudiante tiene cuenta, puede:
- Ingresar a Kubero con su usuario
- Crear sus propios pipelines y apps
- Ver los logs de sus despliegues
- Hacer redespliegues cuando actualiza su código

El profesor **no necesita intervenir** en el proceso de despliegue del estudiante — Kubero está diseñado para que cada usuario gestione sus propios proyectos de forma independiente.

---

## Paso 3 — Monitorear el trabajo de los estudiantes

Desde el dashboard del profesor se pueden ver **todos los pipelines** de todos los usuarios de la plataforma.

1. En el dashboard principal verás los pipelines de todos los estudiantes
2. Puedes hacer clic en cualquier pipeline para ver su estado
3. Puedes ver los logs de cualquier app para verificar que funciona correctamente

![Dashboard del profesor mostrando pipelines de múltiples estudiantes](imagenes/25-dashboard-profesor.png)

> Esto es útil para revisar el estado de los proyectos durante una evaluación o para ayudar a un estudiante a diagnosticar un error sin necesidad de que él comparta su pantalla.

---

## Paso 4 — Limpiar al finalizar el semestre

Al terminar el curso, los pipelines y apps de los estudiantes quedan en el cluster. Para liberar recursos:

**Eliminar un pipeline completo (borra todas sus apps):**
1. Entra al pipeline del estudiante
2. Primero elimina cada app dentro del pipeline (ícono de basura 🗑️ en cada app)
3. Luego elimina el pipeline desde el dashboard (ícono de basura 🗑️)

**Eliminar la cuenta de un estudiante:**
1. Ve a **"Settings"** → **"Users"**
2. Busca al estudiante
3. Haz clic en el ícono de eliminar

![Modal de confirmación para eliminar un pipeline](imagenes/26-eliminar-pipeline.png)
