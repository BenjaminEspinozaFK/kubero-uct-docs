# Base de Datos y Variables de Entorno

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
5. Comprueba el despliegue del servicio (ver logs).

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

---

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
