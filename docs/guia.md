# Plataforma CI/CD Educativa con Kubero

> **Plataforma:** `https://kubero.inf.uct.cl`
> **¿Qué es esto?** Una plataforma que transforma tu `git push` en una aplicación en vivo con URL pública y HTTPS, sin que tengas que tocar servidores ni configurar infraestructura.

---

## Índice de Contenidos

1. [Conceptos Clave](#conceptos-clave)
2. [¿Cómo funciona?](#cómo-funciona)
3. [Roles en la Plataforma](#roles-en-la-plataforma)
4. [Acceder a Kubero](#acceder-a-kubero)
5. [Preparar tu Repositorio en GitHub](#preparar-tu-repositorio-en-github)
6. [Crear un Pipeline](#crear-un-pipeline)
7. [Crear una App y hacer tu primer despliegue](#crear-una-app-y-hacer-tu-primer-despliegue)
8. [Autodeploy: Redespliegue Automático](#autodeploy-redespliegue-automático)
9. [Agregar una Base de Datos (Addon PostgreSQL)](#agregar-una-base-de-datos-addon-postgresql)
10. [Variables de Entorno](#variables-de-entorno)
11. [Routing entre servicios (Frontend + Backend)](#routing-entre-servicios-frontend--backend)
12. [Monitorear tu Despliegue](#monitorear-tu-despliegue)
13. [Gestión de Usuarios (Solo Profesores)](#gestión-de-usuarios-solo-profesores)
14. [Limitaciones Conocidas](#limitaciones-conocidas)

---

## Conceptos Clave

Antes de comenzar, es útil entender algunos términos que aparecerán durante el proceso.

### Kubero
Kubero es la plataforma web que usarás para desplegar tus aplicaciones. Funciona como una capa simplificada sobre Kubernetes: tú defines qué imagen Docker quieres correr y Kubero se encarga de todo lo demás (red, HTTPS, reinicios automáticos, etc.).

### Pipeline
Un **Pipeline** es el contenedor lógico de tu proyecto en Kubero. Dentro de un pipeline puedes tener varias aplicaciones (frontend, backend, etc.) que comparten un mismo ambiente de despliegue (por ejemplo, `production`). Es el equivalente a "tu proyecto" en la plataforma.

```
Pipeline: "mi-proyecto"
└── Fase: production
    ├── App: frontend   → https://frontend.inf.uct.cl
    └── App: backend    → https://backend.inf.uct.cl
```

### Docker e Imagen Docker
**Docker** es una tecnología que empaqueta una aplicación junto con todas sus dependencias (librerías, configuración, runtime) en una unidad llamada **imagen**. Cuando Kubero "despliega" tu app, en realidad descarga y ejecuta esa imagen.

Una imagen Docker es inmutable: si cambias el código y quieres ver los cambios, debes construir una nueva imagen.

### GitHub Actions
**GitHub Actions** es el sistema de automatización de GitHub. Permite ejecutar tareas automáticamente en respuesta a eventos, como un `git push`. En este flujo, GitHub Actions se encarga de construir la imagen Docker cada vez que subes cambios a tu repositorio.

### ghcr.io (GitHub Container Registry)
**ghcr.io** es el servicio de GitHub para almacenar imágenes Docker, similar a cómo GitHub almacena código pero para imágenes. Es el "repositorio de imágenes" al que GitHub Actions sube la imagen construida, y desde donde Kubero la descarga para desplegarla.

### Nginx
**Nginx** (se lee "engine-x") es un servidor web muy usado que puede cumplir dos roles:
- **Servidor de archivos estáticos:** sirve los archivos HTML, CSS y JavaScript del frontend.
- **Proxy inverso:** redirige peticiones HTTP hacia otro servicio. Por ejemplo, puede recibir una petición en `/api/login` y reenviarla internamente al servidor backend.

En aplicaciones con frontend (React, Vue, etc.) y backend separados, el nginx del frontend suele estar configurado para enviar las llamadas a `/api/` al backend automáticamente.

### Addon
Un **Addon** en Kubero es un servicio complementario que la plataforma puede crear y gestionar automáticamente, como una base de datos PostgreSQL. El addon queda disponible solo dentro del cluster (no expuesto a internet) y se conecta a tu app mediante un nombre de servicio interno.

### Container Port
El **Container Port** es el puerto interno donde tu aplicación escucha conexiones dentro del contenedor. No es el puerto público (eso lo gestiona Kubero). Ejemplos comunes:
- Frontends en Nginx: puerto `80`
- Backends en Node.js: puerto `3000`
- Backends en Rust/Python/Java: depende del proyecto (común: `8000`, `8080`)

---

## ¿Cómo funciona?

El flujo completo desde tu código hasta la aplicación en vivo:

```
Tu computador              GitHub Actions              Kubero (UCT)
─────────────              ──────────────              ────────────
  git push        →    Construye imagen Docker   →   Descarga imagen
  (GitHub)             Sube a ghcr.io                Despliega en K8s
                                                      App en HTTPS ✓
```

1. Haces `git push` a tu repositorio en GitHub.
2. GitHub Actions construye automáticamente la imagen Docker y la sube a `ghcr.io`.
3. Kubero descarga esa imagen y la despliega en el cluster.
4. Tu app queda disponible en una URL pública con HTTPS automático.

> **Importante:** Kubero en la UCT usa la estrategia **Container Image** (imagen pre-construida). El build de la imagen ocurre en GitHub Actions, no en Kubero directamente. Esto significa que para ver cambios en producción debes primero hacer push y esperar que GitHub Actions construya la nueva imagen.

---

## Roles en la Plataforma

| Rol | Quién | Qué puede hacer |
|---|---|---|
| **Profesor** | Docente | Crea cuentas de estudiantes, crea pipelines, gestiona proyectos de cursos |
| **Estudiante** | Alumno | Crea pipelines propios, conecta repositorios, despliega apps, ve logs |

> Tanto profesores como estudiantes pueden crear Pipelines y desplegar aplicaciones en Kubero.

---

## Acceder a Kubero

1. Abre tu navegador y ve a **`https://kubero.inf.uct.cl`**
2. Inicia sesión con las credenciales proporcionadas por el profesor.
3. Verás el dashboard principal con todos tus pipelines.

![Pantalla de login de Kubero](imagenes/01-login.png)

![Dashboard principal con pipelines](imagenes/02-dashboard.png)

---

## Preparar tu Repositorio en GitHub

Kubero descarga imágenes desde **GitHub Container Registry (ghcr.io)**. Para que funcione, tu repositorio necesita dos cosas:

1. **Un `Dockerfile`** que describa cómo construir la imagen de tu app
2. **Un workflow de GitHub Actions** que construya y suba la imagen a `ghcr.io` automáticamente

### Agregar el workflow de GitHub Actions

Crea el archivo `.github/workflows/docker-build.yml` en tu repositorio con este contenido:

```yaml
name: Docker Build

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/nombre-de-tu-imagen:latest
```

> Cambia `nombre-de-tu-imagen` por el nombre que quieras darle. Si tu proyecto tiene frontend y backend separados, necesitarás un job por cada uno apuntando al Dockerfile correspondiente.

Después de hacer `git push`, GitHub Actions construirá y publicará la imagen automáticamente. Puedes ver el progreso en la pestaña **"Actions"** de tu repositorio.

![Workflow de GitHub Actions completado exitosamente](imagenes/03-actions-workflow-exitoso.png)

---

### Último paso — Hacer pública la imagen

Por defecto las imágenes en ghcr.io son privadas. Kubero no puede descargarlas si son privadas.

1. Ve a `https://github.com/TU-USUARIO?tab=packages`
2. Haz clic en el nombre de la imagen
3. Ve a **"Package settings"** (esquina inferior derecha)
4. En la sección "Danger Zone", haz clic en **"Change visibility"** → **"Public"**
5. Repite para cada imagen del proyecto (frontend, backend, etc.)

![Package settings con opción de cambiar visibilidad a pública](imagenes/04-package-settings-visibilidad.png)

---

## Crear un Pipeline

Un **Pipeline** agrupa todas las apps de tu proyecto bajo un mismo nombre.

### Pasos

1. En el dashboard de Kubero, haz clic en el botón **"New Pipeline"**

![Botón New Pipeline en el dashboard de Kubero](imagenes/05-nuevo-pipeline-boton.png)

2. Completa el formulario:

   | Campo | Qué ingresar |
   |---|---|
   | **Name** | Nombre de tu proyecto, sin espacios (ej: `taller-web-2024`) |
   | **Phases** | Selecciona `production` |

3. Haz clic en **"Create Pipeline"**

![Formulario de creación de pipeline con nombre y fase completados](imagenes/06-nuevo-pipeline-formulario.png)

4. El pipeline aparece en el dashboard. Haz clic en él para entrar.

![Pipeline recién creado visible en el dashboard](imagenes/07-pipeline-creado-vacio.png)

---

## Crear una App y hacer tu primer despliegue

### Paso 1 — Agregar una App al Pipeline

Dentro de tu pipeline, haz clic en **"Add App"** en la fase `production`.

![Fase production con botón Add App](imagenes/08-add-app-boton.png)

### Paso 2 — Configurar la App

**Sección superior (información básica):**

| Campo | Descripción | Ejemplo |
|---|---|---|
| **App Name** | Nombre del servicio. Solo letras minúsculas y guiones. | `frontend` o `backend` |
| **Domain** | Subdominio donde estará accesible tu app | `mi-app.inf.uct.cl` |
| **Container Port** | Puerto donde escucha tu app dentro del contenedor | `80` (frontend), `8000` (backend) |

> **Sobre el dominio:** Debe ser único en la plataforma. Si `mi-app.inf.uct.cl` ya está en uso, elige algo diferente como `taller2024.inf.uct.cl`. Cualquier subdominio de `*.inf.uct.cl` es válido.

![Formulario de app con App Name, Domain y Container Port completados](imagenes/09-app-formulario-basico.png)

**Sección DEPLOYMENT:**

Aquí se define cómo Kubero descarga y ejecuta tu app.

1. En el selector de estrategia, elige **"Container Image"**
2. Completa los campos que aparecen:

   | Campo | Valor |
   |---|---|
   | **Container Image** | `ghcr.io/tu-usuario/nombre-imagen` (sin el tag) |
   | **Tag** | `latest` |

> El nombre exacto de la imagen lo encuentras en `https://github.com/TU-USUARIO?tab=packages`. Copia el nombre tal como aparece.

![Sección DEPLOYMENT con estrategia Container Image y campos de imagen completados](imagenes/10-app-formulario-deployment.png)

### Paso 3 — Guardar y esperar

1. Haz clic en **"Create App"** o **"Save"**
2. La app aparece en el pipeline con un hexágono gris y sin información de pod (descargando la imagen)
3. En 1-2 minutos aparecerá el nombre del pod junto con valores de **CPU** y **Memory** — eso indica que la app está corriendo correctamente

![App recién creada en estado iniciando](imagenes/11-app-iniciando.png)

![App corriendo con pod, CPU y Memory visibles](imagenes/12-app-running.png)

### Paso 4 — Acceder a tu App

Tu app está disponible en la URL que pusiste en el campo Domain:

```
https://mi-app.inf.uct.cl
```

---

## Autodeploy: Redespliegue Automático

El **autodeploy** permite que cada vez que un estudiante hace `git push` a su repositorio, Kubero redespliega la aplicación automáticamente con la nueva imagen — sin que nadie tenga que hacer nada manualmente.

El flujo completo es:

```
git push → GitHub Actions (construye imagen) → llama API de Kubero → Kubero redespliegue ✓
```

---

### ¿Qué hace el profesor? (una sola vez por curso)

El profesor genera un **token de autorización** para el API de Kubero y lo comparte con los estudiantes. Este token le permite a GitHub Actions autorizarse ante Kubero para solicitar el redepliegue.

1. Accede a `https://kubero.inf.uct.cl` con tu usuario
2. Haz clic en tu avatar (esquina superior derecha) → **"Profile"**
3. En la sección **"API Tokens"**, haz clic en **"+ CREATE TOKEN"**
4. Completa los campos:

   | Campo | Valor |
   |---|---|
   | **Name** | `autodeploy-github` |
   | **Expires At** | Una fecha lejana, ej: `31/12/2027` — debes completar también la hora, ej: `23:59` |

5. Haz clic en **"CREATE"**
6. **Copia el token inmediatamente.** Solo se muestra una vez y no se puede recuperar después.
7. Comparte este token con tus estudiantes. Puede ser el mismo token para todos.

![Pantalla Profile con sección API Tokens y botón Create Token](imagenes/13-autodeploy-profile-tokens.png)

![Modal Create Token con nombre y fecha de expiración completados](imagenes/14-autodeploy-create-token-modal.png)

> Tras hacer clic en **CREATE**, aparecerá una ventana con el token generado y un botón **COPY TOKEN**. Cópialo inmediatamente — solo se muestra una vez y no puede recuperarse. Por seguridad no se incluye captura de esta pantalla.

> Si el token vence o se pierde, el profesor debe generar uno nuevo y cada estudiante deberá actualizar el secret `KUBERO_TOKEN` en su repositorio de GitHub.

---

### ¿Qué hace el estudiante? (una sola vez por proyecto)

Con el token que entregó el profesor, el estudiante lo registra en su repositorio de GitHub y agrega un archivo que activa el redepliegue automático.

#### Paso 1 — Agregar el token como secret en GitHub

1. Ve a tu repositorio en GitHub
2. Haz clic en **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Haz clic en **"New repository secret"**
4. Completa:

   | Campo | Valor |
   |---|---|
   | **Name** | `KUBERO_TOKEN` |
   | **Secret** | Pega el token que te entregó el profesor |

5. Haz clic en **"Add secret"**

![Secrets de GitHub Actions con KUBERO_TOKEN visible en la lista](imagenes/15-autodeploy-github-secrets.png)

> Al hacer clic en **"New repository secret"**, aparecerá un formulario con dos campos: **Name** (escribe `KUBERO_TOKEN`) y **Secret** (pega el token que entregó el profesor). Luego haz clic en **"Add secret"** y el secret quedará visible en la lista con el nombre `KUBERO_TOKEN`.

#### Paso 2 — Agregar el workflow de redepliegue

En tu repositorio, crea el archivo `.github/workflows/deploy.yml` con el siguiente contenido.

Reemplaza los valores marcados con los de tu proyecto en Kubero:

```yaml
name: Deploy to Kubero

on:
  workflow_run:
    workflows: ["Docker Build"]   # Cambia esto por el nombre exacto de tu workflow de build
    types:
      - completed
    branches:
      - main

jobs:
  deploy-kubero:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - name: Redeploy en Kubero
        run: |
          curl -s -o /dev/null -w "%{http_code}\n" -X GET \
            "https://kubero.inf.uct.cl/api/apps/NOMBRE-PIPELINE/production/NOMBRE-APP/restart" \
            -H "Authorization: Bearer ${{ secrets.KUBERO_TOKEN }}"
```

> - `"Docker Build"` → el nombre exacto del workflow que construye tu imagen (revisa la pestaña Actions de tu repo para ver el nombre)
> - `NOMBRE-PIPELINE` → el nombre del pipeline en Kubero (ej: `mi-proyecto`)
> - `NOMBRE-APP` → el nombre de la app dentro del pipeline (ej: `frontend` o `backend`)
> - Si tienes frontend y backend, agrega un paso adicional por cada uno

![Archivo deploy.yml creado en la carpeta .github/workflows del repositorio](imagenes/16-autodeploy-deploy-yml.png)

#### Paso 3 — Verificar que funciona

1. Haz cualquier cambio en tu código y haz `git push` a `main`
2. Ve a la pestaña **"Actions"** de tu repositorio en GitHub
3. Primero se ejecuta el workflow de build (construye la imagen)
4. Al terminar, se activa automáticamente el workflow **"Deploy to Kubero"**
5. El paso debe mostrar `200` como resultado — eso confirma que Kubero recibió el redepliegue

![Pestaña Actions mostrando los workflows GHCR Images y Deploy to Kubero en secuencia](imagenes/17-autodeploy-actions-workflows.png)

![Detalle del step de redeploy mostrando Client: 200 y Server: 200](imagenes/18-autodeploy-step-200.png)

| Código de respuesta | Significado |
|---|---|
| `200` | Redepliegue exitoso |
| `401` o `403` | Token incorrecto o vencido — pídele al profesor uno nuevo |
| `404` | El nombre del pipeline o app no coincide con Kubero — verifica los nombres |

---

## Agregar una Base de Datos (Addon PostgreSQL)

Si tu app necesita una base de datos, Kubero puede crearla como un **Addon**. Esta base de datos es accesible únicamente desde dentro del cluster, nunca desde internet.

### Cómo agregar el Addon

1. Entra a la app que necesita la base de datos (ej: tu `backend`)
2. Haz clic en el ícono de edición (lápiz ✏️)
3. Desplázate hasta la sección **"ADD-ONS"**
4. Haz clic en **"+"** y selecciona **"PostgreSQL"**

![Sección ADD-ONS con addon PostgreSQL y botón Add Addon](imagenes/19-addon-postgresql-boton.png)

5. Completa el formulario:

   | Campo | Descripción | Ejemplo |
   |---|---|---|
   | **PostgreSQL Instance Name** | Identificador del addon | `postgres` |
   | **Version/Tag** | Versión de PostgreSQL | `16-alpine` |
   | **Postgres Password** | Contraseña del usuario administrador de la DB | `mi-password-seguro` |
   | **Additional Username** | Usuario adicional para tu app | `mi_usuario` |
   | **Additional User Password** | Contraseña de ese usuario | `mi-password-seguro` |
   | **Database Name** | Nombre de la base de datos | `mi_base_de_datos` |
   | **Storage Class** | Tipo de almacenamiento en el cluster | `csi-cephfs-sc` |

   > **Importante:** En cada campo escribe **solo el valor**, no el nombre de la variable.
   > - ❌ Incorrecto: `POSTGRES_PASSWORD=mi-password-seguro`
   > - ✅ Correcto: `mi-password-seguro`

![Formulario del addon PostgreSQL con campos vacíos listos para completar](imagenes/20-addon-postgresql-formulario.png)

> El formulario muestra los campos vacíos listos para completar. Los valores por defecto (`postgres`, `17.6`, `8Gi`, `ReadWriteOnce`) pueden dejarse como están en la mayoría de los casos. Los campos sensibles como **Postgres Password**, **Additional Username**, **Additional User Password** y **Database Name** deben completarse con los valores específicos de tu proyecto — no se muestran en la captura por seguridad.

6. Haz clic en **"Save"**

### Nombre del servicio de la base de datos

Kubero crea el servicio de PostgreSQL con el nombre: **`[nombre-de-tu-app]-postgres`**

Por ejemplo, si tu app se llama `server`, el servicio de postgres se llama `server-postgres`.

Este nombre es el **hostname** que debes usar en tu aplicación para conectarte a la base de datos:

```
postgres://mi_usuario:mi-password@server-postgres:5432/mi_base_de_datos
```

> La base de datos creada como addon nunca tiene una URL pública. Solo tu backend puede acceder a ella usando el nombre de servicio interno.

---

## Variables de Entorno

Las variables de entorno permiten pasar configuración a tu app sin necesidad de incluirla en el código. Es la forma segura de manejar contraseñas, URLs y claves API.

### Cómo agregar variables

1. Edita la app en Kubero (ícono lápiz ✏️)
2. Desplázate hasta la sección **"ENVIRONMENT VARIABLES"**
3. Agrega cada variable con su nombre y valor:

   | Variable | Ejemplo de valor |
   |---|---|
   | `DATABASE_URL` | `postgres://usuario:pass@server-postgres:5432/mi_db` |
   | `JWT_SECRET` | `clave-secreta-larga-y-aleatoria` |
   | `NODE_ENV` | `production` |

4. Haz clic en **"Save"**. Kubero reiniciará la app automáticamente con las nuevas variables.

![Sección de variables de entorno con ejemplos configurados](imagenes/21-env-variables.png)

> **Nunca subas contraseñas o claves secretas a Git.** Usa siempre las variables de entorno de Kubero para pasar información sensible.

---

## Routing entre servicios (Frontend + Backend)

En aplicaciones donde el frontend (React, Vue, etc.) y el backend están separados, el frontend necesita saber cómo llegar al backend para hacer llamadas a la API.

### El problema

El frontend en producción es solo archivos estáticos servidos por nginx. Cuando el usuario hace una acción que requiere datos del servidor (ej: iniciar sesión), el navegador hace una petición a `/api/login`. Pero nginx no sabe a dónde enviar esa petición.

### La solución: configurar nginx como proxy inverso

La forma correcta es configurar el `nginx.conf` del frontend para que redirija automáticamente todas las peticiones a `/api/` hacia el servicio interno del backend.

El servicio interno del backend en Kubero tiene el nombre: **`[nombre-app]-kuberoapp`**

Por ejemplo, si tu app backend se llama `server`, el servicio interno es `server-kuberoapp` y escucha en el puerto `80`.

### Ejemplo de configuración nginx

En el archivo `nginx.conf` (o `nginx.prod.conf`) del frontend, agrega el bloque `location /api/`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Archivos estáticos del frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Redirigir llamadas API al backend interno
    location /api/ {
        proxy_pass http://server-kuberoapp:80/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Nota:** El nombre `server-kuberoapp` en la línea `proxy_pass` debe coincidir con el nombre de tu app backend en Kubero. Si tu app se llama `api`, el servicio es `api-kuberoapp`.

---

## Monitorear tu Despliegue

### Estado de la App (hexágono en Kubero)

El hexágono de cada app en el pipeline indica su estado:

| Estado | Significado |
|---|---|
| Gris / vacío | La app está iniciando o la imagen se está descargando |
| Verde | La app está corriendo correctamente |
| Rojo / amarillo | Hubo un error. Revisa los logs |

> La vista del pipeline con las apps corriendo se ve igual a la imagen anterior (sección "Verificar que tu App está Corriendo").

### Ver Logs en Tiempo Real

Los logs muestran la salida de tu aplicación y son la principal herramienta para diagnosticar errores.

1. Haz clic en el ícono del reloj ⏱ (o "Logs") en tu app
2. Verás la salida de tu aplicación en tiempo real

![Logs de la aplicación en tiempo real en Kubero](imagenes/22-logs-kubero.png)

### Errores comunes y cómo resolverlos

| Error en logs | Causa | Solución |
|---|---|---|
| `Name does not resolve` | El hostname de la base de datos está mal escrito | Verifica que `POSTGRES_HOST` sea `[tu-app]-postgres` |
| `password authentication failed` | Las credenciales de la DB no coinciden | Revisa que `POSTGRES_USER` y `POSTGRES_PASSWORD` sean los mismos que configuraste en el addon |
| `connection refused` | Puerto equivocado o servicio no está corriendo | Verifica el puerto (postgres: `5432`, no `80`) |
| `ImagePullBackOff` | Kubero no puede descargar la imagen | Verifica que la imagen en ghcr.io sea pública |
| `CrashLoopBackOff` | La app inicia y falla repetidamente | Lee los logs para ver el error específico |

---

## Gestión de Usuarios (Solo Profesores)

Esta sección describe el flujo completo del profesor: desde inscribir estudiantes hasta monitorear sus despliegues y limpiar al final del semestre.

---

### Paso 1 — Inscribir estudiantes en la plataforma

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

### Paso 2 — El estudiante trabaja de forma autónoma

Una vez que el estudiante tiene cuenta, puede:
- Ingresar a Kubero con su usuario
- Crear sus propios pipelines y apps
- Ver los logs de sus despliegues
- Hacer redespliegues cuando actualiza su código

El profesor **no necesita intervenir** en el proceso de despliegue del estudiante — Kubero está diseñado para que cada usuario gestione sus propios proyectos de forma independiente.

---

### Paso 3 — Monitorear el trabajo de los estudiantes

Desde el dashboard del profesor se pueden ver **todos los pipelines** de todos los usuarios de la plataforma.

1. En el dashboard principal verás los pipelines de todos los estudiantes
2. Puedes hacer clic en cualquier pipeline para ver su estado
3. Puedes ver los logs de cualquier app para verificar que funciona correctamente

![Dashboard del profesor mostrando pipelines de múltiples estudiantes](imagenes/25-dashboard-profesor.png)

> Esto es útil para revisar el estado de los proyectos durante una evaluación o para ayudar a un estudiante a diagnosticar un error sin necesidad de que él comparta su pantalla.

---

### Paso 4 — Limpiar al finalizar el semestre

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

---

## Limitaciones Conocidas

Estas son limitaciones de la configuración actual de Kubero en la UCT que es importante conocer:

| Limitación | Descripción |
|---|---|
| **No hay build interno** | Kubero en la UCT no construye imágenes internamente. Siempre debes usar la estrategia "Container Image" con imágenes ya construidas en GitHub Actions y subidas a ghcr.io |
| **Dominio obligatorio** | Kubero requiere un dominio para todas las apps. Si no quieres exponer un servicio, igual debes ingresar un dominio (pero el servicio no tendrá ingress público si es un addon) |
| **Health checks en PostgreSQL** | Kubero activa health checks HTTP para todas las apps por defecto, lo que falla en servicios que no hablan HTTP (como PostgreSQL). Si el addon de postgres crashea, desactiva los health checks en la sección **HEALTH CHECKS** de la app |
| **Routing multi-servicio** | Si el frontend y el backend comparten el mismo dominio, el nginx del frontend debe estar configurado para hacer `proxy_pass` al servicio interno del backend. Esto debe hacerse en el `nginx.conf` de la imagen del frontend |
