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
