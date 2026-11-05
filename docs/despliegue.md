# Crear pipeline, apps, base de datos y variables

Sigue este recorrido: crear el pipeline, desplegar el backend, agregar su base de datos y variables, y desplegar el frontend. Luego conecta el frontend con el backend (routing), prueba el proyecto y revisa su monitoreo antes de activar [Autodeploy](autodeploy.md).

Prepara la imagen siguiendo [Primeros pasos](primeros-pasos.md) y confirma que perteneces al equipo del proyecto.

## Crear un Pipeline

Un **pipeline** agrupa las aplicaciones de un proyecto y establece qué equipos tienen acceso.

### Pasos

1. En **Pipelines**, haz clic en **Nuevo pipeline**.

![Pipeline encontrado mediante la búsqueda](imagenes/pipeline-filtrado.png)

2. Completa los campos:

| Campo | Qué ingresar |
|---|---|
| **Nombre** | Identificador del proyecto, por ejemplo `taller-web-2024`. |
| **Acceso de equipo** | El equipo de tu grupo o trabajo individual creado por el profesor. |
| **Dominio (FQDN)** | Dominio base habilitado para el curso, cuando corresponda. |
| **Fases** | Activa **Production** y selecciona el contexto de clúster ofrecido para esa fase. |

![Formulario actual de pipeline con acceso de equipo, dominio y fases](imagenes/pipeline-formulario-actual.png)

::: warning Importante
Selecciona al menos el equipo del proyecto. El equipo debe existir y tener sus miembros asignados; escribir un nombre no incorpora personas automáticamente. La captura muestra la disposición del formulario antes de completar todos los campos.
:::

3. Haz clic en **Crear pipeline**.
4. Busca el pipeline creado y ábrelo.

![Pipeline encontrado mediante la búsqueda](imagenes/pipeline-filtrado.png)


## Crear una App y hacer tu primer despliegue

### Paso 1 — Agregar una App al Pipeline

Dentro del pipeline, pulsa **Nueva app** en la fase `production`. Configura frontend y backend como aplicaciones independientes. Si tu proyecto usa ambos, comienza por el backend y completa su base de datos y variables antes de crear el frontend.

![Vista de aplicaciones de un pipeline vacío](imagenes/pipeline-aplicaciones-vacio.png)

### Paso 2 — Configurar la App

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Nombre de la app** | Identificador del servicio; usa un nombre sencillo en minúsculas. | `frontend` |
| **Puerto del contenedor** | Puerto real del proceso dentro de la imagen. | `80` para Nginx; `3000` para un backend que escucha allí. |
| **Dominio** | Subdominio donde estará accesible tu app | `mi-app.inf.uct.cl` |
| **SSL** | Actívalo para configurar HTTPS en ese dominio. | Activado para una app pública del curso. |

![Formulario actual con nombre, puerto, dominio y SSL](imagenes/app-formulario-actual.png)

> **Sobre el dominio:** Debe ser único en la plataforma. Si `mi-app.inf.uct.cl` ya está en uso, elige algo diferente como `taller2024.inf.uct.cl`. Cualquier subdominio de `*.inf.uct.cl` es válido.

**Añadir dominio** incorpora otros hosts a la misma app. Para un servicio interno, deja los dominios vacíos y consulta [App interna sin exposición pública](#app-interna-sin-exposicion-publica-imagen-custom).

En **Despliegue**, completa directamente la imagen y la etiqueta.

| Campo | Valor de ejemplo |
|---|---|
| **Imagen del contenedor** | `ghcr.io/tu-usuario/nombre-imagen`, sin la etiqueta. |
| **Etiqueta (Tag)** | `latest` o la versión que publicaste. |

> El nombre exacto de la imagen lo encuentras en `https://github.com/TU-USUARIO?tab=packages`. Copia el nombre tal como aparece.

![Sección de despliegue con imagen y etiqueta](imagenes/app-imagen-contenedor.png)

El **Comando** aparece al tener la configuración avanzada activada; conserva el comando original de la imagen si no necesitas reemplazarlo.

### Paso 3 — Guardar y esperar

1. Pulsa **Crear app** al crearla o **Actualizar** al editarla.
2. Vuelve a la tabla del pipeline. Mientras se prepara el despliegue puede mostrar **Métricas no disponibles**.
3. En 1-2 minutos aparecerá el nombre del pod junto con valores de **CPU** y **Memory** eso indica que la app está corriendo correctamente. Si faltan datos, revisa también **Resumen**, **Registros** y **Eventos** dentro de la app: una métrica ausente no demuestra por sí sola que la app esté detenida.

![Aplicación recién creada sin métricas disponibles](imagenes/app-iniciando-actual.png)

![Aplicaciones con pod, CPU y memoria](imagenes/app-recursos-actual.png)

El tiempo de inicio depende de la imagen, sus recursos y el clúster. Si no arranca, consulta [Errores comunes](#errores-comunes-y-como-resolverlos).

### Paso 4 — Acceder a tu App

Tu app está disponible en la URL con el dominio configurado. Por ejemplo:

~~~text
https://mi-app.inf.uct.cl
~~~

Comprueba que responde y que el puerto coincide con el de la imagen.

## Agregar una Base de Datos (Addon PostgreSQL)

Los **Complementos** permiten incorporar servicios como PostgreSQL a tu aplicación. En el flujo del curso, la base de datos se usa por su servicio interno; no necesita un dominio público.

### Cómo agregar el Addon

1. Abre la app que necesita la base de datos y pulsa el lápiz para editarla.

![Aplicación recién creada sin métricas disponibles](imagenes/app-iniciando-actual.png)

2. Busca **Complementos** y pulsa **Add Addon** o el botón **+**.
3. Selecciona **PostgreSQL** y completa el formulario ofrecido por la plantilla.

![Complemento PostgreSQL en el formulario actual de la app](imagenes/app-complementos-actual.png)


| Campo | Descripción | Ejemplo |
|---|---|---|
| **PostgreSQL Instance Name** | Identificador del addon | `postgres` |
| **Version/Tag** | Versión de PostgreSQL | `16-alpine` |
| **Postgres Password** | Contraseña del usuario administrador de la DB | `mi-password-seguro` |
| **Additional Username** | Usuario adicional para tu app | `mi_usuario` |
| **Additional User Password** | Contraseña de ese usuario | `mi-password-seguro` |
| **Database Name** | Nombre de la base de datos | `mi_base_de_datos` |
| **Storage Class** | Tipo de almacenamiento en el cluster | Deja el valor por defecto que aparece en el formulario |

> **Importante:** En cada campo escribe **solo el valor**, no el nombre de la variable.
> - ❌ Incorrecto: `POSTGRES_PASSWORD=mi-password-seguro`
> - ✅ Correcto: `mi-password-seguro`


> El formulario muestra los campos vacíos listos para completar. Los valores por defecto (`postgres`, `17.6`, `8Gi`, `ReadWriteOnce`) pueden dejarse como están en la mayoría de los casos. Los campos sensibles como **Postgres Password**, **Additional Username**, **Additional User Password** y **Database Name** deben completarse con los valores específicos de tu proyecto.


4. Guarda la configuración del complemento y pulsa **Actualizar** en la app.
5. Configura la conexión del backend en sus variables de entorno, como se indica a continuación, y comprueba los registros.

### Nombre del servicio de la base de datos

Kubero crea el servicio de PostgreSQL con el nombre: **`[nombre-de-tu-app]-postgres`**

Por ejemplo, si tu app se llama `server`, el servicio de postgres se llama `server-postgres`.

Este nombre es el **hostname** que debes usar en tu aplicación para conectarte a la base de datos:

```
postgres://mi_usuario:mi-password@server-postgres:5432/mi_base_de_datos
```

> La base de datos creada como addon nunca tiene una URL pública. Solo tu backend puede acceder a ella usando el nombre de servicio interno.

## Variables de Entorno

Las variables separan configuración y código. La guía completa está en [Extras → Variables de entorno](extras/variables-de-entorno.md).

### Cómo agregar variables

1. Edita la app en Kubero (ícono lápiz ✏️) y abre **Variables de entorno**.
2. Agrega pares de nombre y valor o importa un archivo `.env`.
3. Revisa los valores y pulsa **Actualizar**.
4. Comprueba que el despliegue usa la nueva configuración.

![Variables de entorno con campos de nombre, valor e importación de archivo](imagenes/app-variables-entorno2.png)

::: warning Configuración sensible
No publiques contraseñas ni claves en Git o en las variables del frontend que se incorporan al navegador. Los valores de conexión de estas guías son ejemplos; reemplázalos con los datos del proyecto.
:::

### Conectar el backend con PostgreSQL

Kubero no agrega automáticamente la conexión del complemento a las variables de tu app. En **Variables de entorno** del backend, crea `DATABASE_URL` con los datos configurados en el addon:

~~~env
DATABASE_URL=postgres://mi_usuario:CONTRASENA_DEL_PROYECTO@server-postgres:5432/mi_base_de_datos
~~~

Reemplaza usuario, contraseña y nombre de base por los del complemento. El host debe coincidir con el nombre real de la app: si se llama `server2`, usa `server2-postgres`. Guarda con **Actualizar** y revisa los registros del backend para confirmar la conexión.

## Crear el frontend

Una vez que el backend se conecte a su base de datos, crea la app del frontend en el mismo pipeline siguiendo los pasos anteriores, con su propia imagen, puerto y dominio. Después conecta ambas apps como se indica a continuación.

## Routing entre servicios (Frontend + Backend)

En aplicaciones donde el frontend (React, Vue, etc.) y el backend están separados, el frontend necesita saber cómo llegar al backend para hacer llamadas a la API.

### La solución en Kubero UCT: dominios separados

La forma correcta en esta plataforma es darle a cada servicio su **propio dominio** en Kubero. Así el frontend llama directamente al dominio público del backend — sin configuraciones especiales de nginx ni acceso al cluster.

**Ejemplo:**
| App | Dominio en Kubero |
|---|---|
| Frontend | `mi-proyecto.inf.uct.cl` |
| Backend | `api-mi-proyecto.inf.uct.cl` |

El frontend hace sus llamadas API directamente a `https://api-mi-proyecto.inf.uct.cl` desde el código.

### Revisar los dominios de las apps

Comprueba que las apps que creaste dentro del pipeline tengan dominios distintos:

- App `frontend` → Domain: `mi-proyecto.inf.uct.cl`
- App `backend` → Domain: `api-mi-proyecto.inf.uct.cl`

Activa SSL en ambas apps para acceder por HTTPS desde sus respectivos dominios.

### Configurar la URL del backend en el frontend

Como en la demo, copia el dominio real del backend y úsalo como `API_URL` en `client/app.js` si tu proyecto define allí la conexión.

Para un frontend construido con Vite:

~~~env
VITE_API_URL=https://api-mi-proyecto.inf.uct.cl
~~~

Las variables `VITE_*` se incorporan durante la **construcción** del frontend. Si tu imagen sirve archivos estáticos, agregarlas únicamente al contenedor en ejecución no cambia esos archivos: incorpora el valor al build y publica una nueva imagen, o usa la configuración de runtime que implemente tu proyecto. Consulta [Variables de entorno en Vite](https://vite.dev/guide/env-and-mode.html).

~~~javascript
const API_URL = import.meta.env.VITE_API_URL

const response = await fetch(API_URL + '/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
~~~

Para este recorrido usa dominios separados. Si tu proyecto necesita un proxy `/api/` en el frontend, configura explícitamente el `nginx.conf` de su imagen para dirigir las peticiones al servicio interno del backend. Revisa también [CORS](extras/cors.md) si el navegador bloquea las peticiones entre dominios.

### Reconstruir, redesplegar y probar

1. Guarda el cambio de la URL de la API, crea un commit y haz `git push`.
2. Espera a que termine el workflow de construcción en **Actions** de GitHub.
3. Redespliega el frontend manualmente en Kubero para usar la nueva imagen. En este punto todavía no necesitas Autodeploy.
4. Abre el dominio del frontend y prueba una operación que use el backend y la base de datos, como crear y borrar una tarea en la demo.
5. Si el navegador sigue mostrando una versión anterior, recarga con `Ctrl+Shift+R`.

## Monitorear tu Despliegue

### Estado de la App


![Tabla actual de aplicaciones, despliegue y recursos](imagenes/app-recursos-actual.png)

Revisa pod, CPU y memoria cuando estén disponibles. **Métricas no disponibles** puede indicar que aún no hay mediciones; verifica **Resumen** y **Eventos** antes de concluir que el servicio está detenido.
### Ver Logs en Tiempo Real

1. Abre la aplicación desde la tabla del pipeline.
2. Selecciona **Registros**.
3. Usa **Abrir registros** si aparece ese botón.
4. Elige el origen disponible: **Run** para la app o **Addons** para sus complementos.

![Pestaña actual de registros con vista Run y Addons](imagenes/app-registros-actual.png)

Los registros ayudan a diagnosticar inicio, conexión y fallos de la aplicación. En la demo, el backend confirma `Conectado a la base de datos.` y `Servidor escuchando en el puerto 3000`; en tu proyecto, busca los mensajes equivalentes.

### Errores comunes y cómo resolverlos

| Error en logs | Causa | Solución |
|---|---|---|
| `Name does not resolve` | El hostname de la base de datos está mal escrito | Verifica que `POSTGRES_HOST` sea `[tu-app]-postgres` |
| `password authentication failed` | Las credenciales de la DB no coinciden | Revisa que `POSTGRES_USER` y `POSTGRES_PASSWORD` sean los mismos que configuraste en el addon |
| `connection refused` | Puerto equivocado o servicio no está corriendo | Verifica el puerto (postgres: `5432`, no `80`) |
| `ImagePullBackOff` | Kubero no puede descargar la imagen | Verifica que la imagen en ghcr.io sea pública |
| `Read-only file system` al iniciar Nginx | Nginx necesita escribir directorios temporales y la raíz está en modo de solo lectura | Si aparece el error de la demo sobre `/var/cache/nginx/client_temp`, desactiva `readOnlyRootFilesystem` en la [configuración de seguridad](extras/seguridad.md) del frontend y redespliega |
| `CrashLoopBackOff` | La app inicia y falla repetidamente | Lee los logs para ver el error específico |

Cuando el proyecto funcione con despliegues manuales y hayas comprobado sus registros, continúa con [Autodeploy](autodeploy.md). Las secciones siguientes cubren servicios internos y configuración adicional si tu proyecto los necesita.

## App Interna sin Exposición Pública (Imagen Custom)

Puedes desplegar una imagen personalizada como app interna, por ejemplo una base de datos con extensiones que el complemento disponible no incluya.

### ¿Cuándo usar esto?

| Caso | Ejemplo |
|---|---|
| Base de datos con extensiones | Una imagen de PostgreSQL con extensiones de tu proyecto. |
| Servicio de caché o mensajería | Redis u otro servicio accesible desde el backend. |
| Contenedor sin servidor HTTP | Proceso interno que no necesita ingress público. |

### Cómo crear una app interna

| Campo | Qué hacer |
|---|---|
| **Dominio** | Dejarlo vacío; no agregar otros dominios. |
| **Imagen del contenedor** | Imagen del servicio preparada para tu proyecto. |
| **Etiqueta (Tag)** | Versión compatible con tu aplicación. |
| **Puerto del contenedor** | Puerto real, por ejemplo `5432` para PostgreSQL. |
| **Réplicas web** | Habitualmente `1` para un servicio de una sola instancia. |

Configura las variables que requiere esa imagen y, si guarda datos, un volumen en la ruta de datos correcta. **SSL** y las opciones de ingress no sustituyen la ausencia de un dominio público.


### Desactivar Health Checks

Los contenedores que no son servidores HTTP (como Postgres o Redis) fallarán los health checks que Kubero activa por defecto. Debes desactivarlos:

1. En la pantalla de edición de la app, busca la sección **"HEALTH CHECKS"**
2. Desactivalo

Si no los desactivas, el pod entrará en `CrashLoopBackOff` porque Kubero intentará hacer peticiones HTTP al puerto del contenedor y fallará.

### Cómo conectarse desde otra app

En este flujo se usa el nombre de servicio `[nombre-de-app]-kuberoapp` para una app interna. Confirma el servicio del despliegue y que el backend pueda resolverlo en su namespace.

~~~env
# Ejemplo: servicio de una app interna llamada mi-db
DATABASE_URL=postgres://usuario:CONTRASENA_DEL_PROYECTO@mi-db-kuberoapp:5432/mi_base_de_datos
~~~

Registra la conexión en las variables del **backend**, no en el código público del frontend.

### Ejemplo completo: Apache AGE (Postgres para grafos)

Si tu proyecto necesita una imagen como `apache/age`, comprueba la etiqueta disponible y las instrucciones de esa imagen. Configura un nombre como `age-db`, puerto `5432` y dominio vacío.

Define `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` según la imagen y monta almacenamiento en su ruta de datos. No asumas que todas las imágenes de PostgreSQL usan la misma ruta o usuario.

~~~env
DATABASE_URL=postgres://mi_usuario:CONTRASENA_DEL_PROYECTO@age-db-kuberoapp:5432/mi_grafo_db
~~~

### ⚠️ Almacenamiento: las apps internas NO guardan datos por defecto

Cuando despliegas una app en Kubero (incluida una app interna sin dominio) usando el formulario normal de **"Create App"**, el almacenamiento que se le asigna es **efímero** (`emptyDir` en términos de Kubernetes). Eso significa que si el pod se reinicia — por una actualización, un error, o simplemente porque el nodo lo reprograma — **todo lo que hayas guardado dentro del contenedor se pierde**.

Esto es distinto de los **Addons** (como el PostgreSQL de la primera sección de esta página), que sí incluyen un campo de **Storage Class** en su formulario y sí sobreviven a un reinicio.

| Tipo de recurso | ¿Tiene almacenamiento persistente? | Dónde se configura |
|---|---|---|
| Addon (PostgreSQL, MySQL, MongoDB, Redis, etc.) | ✅ Sí, por defecto | Campo **Storage Class** en el formulario del addon |
| App normal (con o sin dominio, imagen custom) | ❌ No, por defecto | No existe ese campo en el formulario de apps |

**¿Cuándo importa esto?**

- Si tu servicio interno es una base de datos de un tipo que **sí** está entre los addons de Kubero (Postgres, MySQL, MongoDB, etc.), usa el addon en vez de una app custom — ya trae persistencia resuelta.
- Consulta [Volúmenes](extras/volumenes.md) si necesitas una imagen que **no** es uno de esos addons (como el ejemplo de Apache AGE de arriba) y sí necesita guardar datos entre reinicios.


### Cómo verificar que la conexión interna funciona

Antes de conectar tu app real, puedes confirmar que el servicio interno responde. Entra a la consola web de tu app (o a una terminal con acceso al cluster) y prueba:

```bash
# ¿El puerto responde? (reemplaza por el nombre y puerto de tu servicio)
nc -zv mi-db-kuberoapp 5432

# ¿El nombre resuelve correctamente?
nslookup mi-db-kuberoapp
```

Si `nc` responde `open`, el servicio está activo y accesible por nombre desde tu proyecto. Si da `refused` o se queda esperando, revisa que el puerto configurado en **Container Port** coincida con el puerto real que usa tu imagen.

## Configuración adicional

Activa **Configuración avanzada de la aplicación** cuando necesites sus controles adicionales. Cada tema tiene una guía en **Extras**:

- [Autenticación básica](extras/autenticacion-basica.md) y [Seguridad](extras/seguridad.md).
- [Redes](extras/redes.md), [CORS](extras/cors.md) y [Kubernetes](extras/kubernetes.md).
- [Variables de entorno](extras/variables-de-entorno.md), [Recursos](extras/recursos.md) y [Volúmenes](extras/volumenes.md).
- [Cronjobs](extras/cronjobs.md) y [Comprobaciones de estado](extras/health-checks.md).

Sigue primero el recorrido básico y configura solo las secciones necesarias para tu aplicación.

## Limitaciones Conocidas

Estas son limitaciones de la configuración actual de Kubero en la UCT que es importante conocer:

| Limitación | Descripción |
|---|---|
| **No hay build interno** | Kubero en la UCT no construye imágenes internamente. Siempre debes usar la estrategia "Container Image" con imágenes ya construidas en GitHub Actions y subidas a ghcr.io |
| **Dominio opcional para servicios internos** | Si no quieres que una app sea pública, deja el campo Domain vacío — no se creará ingress y el servicio solo estará disponible dentro del cluster. Esto es útil para bases de datos con imagen custom u otros servicios internos (ver [App interna sin exposición pública](#app-interna-sin-exposicion-publica-imagen-custom)) |
| **Health checks en PostgreSQL** | Kubero activa health checks HTTP para todas las apps por defecto, lo que falla en servicios que no hablan HTTP (como PostgreSQL). Para una app interna con imagen de PostgreSQL, revisa la sección [Desactivar Health Checks](#desactivar-health-checks) |
| **Routing multi-servicio** | Si el frontend y el backend comparten el mismo dominio, el nginx del frontend debe estar configurado para hacer `proxy_pass` al servicio interno del backend. Esto debe hacerse en el `nginx.conf` de la imagen del frontend |
| **Addons fijos** | Los addons predefinidos (PostgreSQL, Redis, etc.) usan imágenes estándar. Si necesitas una imagen custom (ej: Apache AGE, PostGIS), debes crear una **app interna sin dominio público** en vez de usar el addon — ver [App interna sin exposición pública](#app-interna-sin-exposicion-publica-imagen-custom) |