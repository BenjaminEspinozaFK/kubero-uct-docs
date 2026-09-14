# Base de Datos y Variables de Entorno

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
   | **Storage Class** | Tipo de almacenamiento en el cluster | Deja el valor por defecto que aparece en el formulario |

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

## App Interna sin Exposición Pública (Imagen Custom)

Kubero permite desplegar **cualquier imagen Docker** como una app interna — sin dominio público y sin que sea accesible desde internet. Esto es útil cuando necesitas una base de datos con imagen personalizada u otro servicio interno que el addon estándar no cubre.

### ¿Cuándo usar esto?

| Caso | Ejemplo |
|---|---|
| Base de datos con extensiones especiales | Apache AGE (Postgres para grafos), PostGIS, TimescaleDB |
| Imagen de Postgres propia | Tu propio `ghcr.io/usuario/mi-postgres:latest` |
| Servicio interno (Redis, RabbitMQ, etc.) | No expuesto a internet, solo para otros pods |
| Cualquier contenedor que no habla HTTP | Servicios de mensajería, caches, BDs no relacionales |

### Cómo crear una app interna

Al crear la app en Kubero, completa los campos así:

| Campo | Qué hacer |
|---|---|
| **Domain** | **Déjalo vacío** — sin dominio no se crea ingress público |
| **Container Image** | URL de tu imagen (`apache/age`, `redis`, etc.) |
| **Tag** | Versión de la imagen (`latest`, `16`, etc.) |
| **Container Port** | Puerto que expone el contenedor (`5432` para Postgres, `6379` para Redis) |
| **Web Replicas** | `1` normalmente |

> Dejar el campo **Domain vacío** es lo que impide que la app quede expuesta a internet. Sin dominio, Kubero no crea una regla de ingress funcional.

### Desactivar Health Checks

Los contenedores que no son servidores HTTP (como Postgres o Redis) fallarán los health checks que Kubero activa por defecto. Debes desactivarlos:

1. En la pantalla de edición de la app, busca la sección **"HEALTH CHECKS"**
2. Desactiva las opciones de liveness y readiness probe

Si no los desactivas, el pod entrará en `CrashLoopBackOff` porque Kubero intentará hacer peticiones HTTP al puerto del contenedor y fallará.

### Cómo conectarse desde otra app

Kubero crea un servicio interno de Kubernetes con el nombre **`[nombre-de-tu-app]-kuberoapp`**.

**Ejemplo:** si tu app se llama `mi-db`, el hostname interno es `mi-db-kuberoapp`.

Desde tu backend, la conexión sería:

```env
# Para Postgres (app interna llamada "mi-db")
DATABASE_URL=postgres://usuario:password@mi-db-kuberoapp:5432/mi_base_de_datos

# Para Redis (app interna llamada "mi-cache")
REDIS_URL=redis://mi-cache-kuberoapp:6379
```

Agrega esa variable de entorno en la app de tu **backend** dentro de Kubero (sección ENVIRONMENT VARIABLES).

### Ejemplo completo: Apache AGE (Postgres para grafos)

[Apache AGE](https://age.apache.org/) es una imagen de Postgres con soporte para grafos (openCypher). No está disponible como addon, pero puedes correrla como app interna:

| Campo | Valor |
|---|---|
| **App name** | `age-db` |
| **Domain** | *(vacío)* |
| **Container Image** | `apache/age` |
| **Tag** | `latest` |
| **Container Port** | `5432` |

Variables de entorno para la app `age-db`:

| Variable | Valor |
|---|---|
| `POSTGRES_USER` | `mi_usuario` |
| `POSTGRES_PASSWORD` | `mi_password` |
| `POSTGRES_DB` | `mi_grafo_db` |

Conexión desde tu backend (sección ENVIRONMENT VARIABLES de la app backend):

```env
DATABASE_URL=postgres://mi_usuario:mi_password@age-db-kuberoapp:5432/mi_grafo_db
```

> **Nota:** Esta estrategia funciona para cualquier imagen que necesites — no estás limitado a los addons predefinidos de Kubero.

### ⚠️ Almacenamiento: las apps internas NO guardan datos por defecto

Este es el punto que más confunde a quien prueba esto por primera vez, así que léelo con calma.

Cuando despliegas una app en Kubero (incluida una app interna sin dominio) usando el formulario normal de **"Create App"**, el almacenamiento que se le asigna es **efímero** (`emptyDir` en términos de Kubernetes). Eso significa que si el pod se reinicia — por una actualización, un error, o simplemente porque el nodo lo reprograma — **todo lo que hayas guardado dentro del contenedor se pierde**.

Esto es distinto de los **Addons** (como el PostgreSQL de la primera sección de esta página), que sí incluyen un campo de **Storage Class** en su formulario y sí sobreviven a un reinicio.

| Tipo de recurso | ¿Tiene almacenamiento persistente? | Dónde se configura |
|---|---|---|
| Addon (PostgreSQL, MySQL, MongoDB, Redis, etc.) | ✅ Sí, por defecto | Campo **Storage Class** en el formulario del addon |
| App normal (con o sin dominio, imagen custom) | ❌ No, por defecto | No existe ese campo en el formulario de apps |

**¿Cuándo importa esto?**

- Si tu servicio interno es una base de datos de un tipo que **sí** está entre los addons de Kubero (Postgres, MySQL, MongoDB, etc.), usa el addon en vez de una app custom — ya trae persistencia resuelta.
- Si necesitas una imagen que **no** es uno de esos addons (como el ejemplo de Apache AGE de arriba) y sí necesita guardar datos entre reinicios, el formulario de Kubero no te da esa opción todavía. Hay que agregar el volumen manualmente por fuera de la interfaz — habla con quien administra el clúster para que te ayude a vincular un `PersistentVolumeClaim` a tu app.

> Esta limitación fue detectada durante el desarrollo del fork de Kubero para la UCT y quedó registrada como mejora pendiente: agregar un campo de almacenamiento persistente al formulario de apps, igual al que ya tienen los addons.

### Cómo verificar que la conexión interna funciona

Antes de conectar tu app real, puedes confirmar que el servicio interno responde. Entra a la consola web de tu app (o a una terminal con acceso al cluster) y prueba:

```bash
# ¿El puerto responde? (reemplaza por el nombre y puerto de tu servicio)
nc -zv mi-db-kuberoapp 5432

# ¿El nombre resuelve correctamente?
nslookup mi-db-kuberoapp
```

Si `nc` responde `open`, el servicio está activo y accesible por nombre desde tu proyecto. Si da `refused` o se queda esperando, revisa que el puerto configurado en **Container Port** coincida con el puerto real que usa tu imagen.

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
