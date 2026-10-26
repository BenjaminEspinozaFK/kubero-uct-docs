# Seguridad

Este panel configura cómo se ejecuta el contenedor: permisos de escritura, identidad y capacidades de Linux. Úsalo para ajustar una imagen a las necesidades de tu app.

## Dónde configurarla

En **Crear app** o **Editar app**, activa **Configuración avanzada de la app** y abre **Seguridad**.

![Panel de seguridad con sistema de archivos, usuario, grupo y capacidades](../imagenes/app-seguridad.png)

## Campos

| Campo | Explicación |
|---|---|
| Sistema de archivos de solo lectura | Impide escribir en el sistema de archivos raíz del contenedor. Está activado inicialmente. |
| Permitir escalada de privilegios | Controla si un proceso puede obtener más privilegios. Está desactivado inicialmente. |
| Ejecutar como no root | Exige una identidad distinta del usuario root. |
| Ejecutar como usuario | UID numérico que ejecuta el proceso. |
| Ejecutar como grupo | GID numérico del proceso. |
| Agregar capacidades | Selección de capacidades adicionales que necesita la imagen. |
| Eliminar capacidades | Selección de capacidades que se retiran al contenedor. |

## Pasos y ejemplo

1. Revisa el usuario y las rutas de escritura que requiere tu imagen.
2. Para una imagen preparada para UID/GID `1000`, introduce esos valores y activa **Ejecutar como no root**.
3. Mantén desactivada la escalada de privilegios.
4. Si la app escribe en `/app/data`, configura un [Volumen](volumenes.md) en esa ruta.
5. Guarda y verifica el inicio en **Registros** y **Eventos**.

El UID `1000` es un ejemplo: usa la identidad admitida por tu imagen. Si aparece `Read-only file system`, identifica la ruta que necesita escritura antes de cambiar el ajuste.

## Ejemplo común: frontend con nginx (`nginx:alpine`)

El caso más frecuente con el que te vas a topar es un frontend construido
sobre `nginx:alpine` (muy habitual para servir un build de React, Vue, o
archivos estáticos simples). Como **Sistema de archivos de solo lectura**
viene activado por defecto en toda App nueva, nginx falla al arrancar con un
error como este en los **Registros**:

```
2026/10/26 19:27:58 [emerg] 1#1: mkdir() "/var/cache/nginx/client_temp" failed (30: Read-only file system)
nginx: [emerg] mkdir() "/var/cache/nginx/client_temp" failed (30: Read-only file system)
```

Esto pasa porque nginx, al iniciar, intenta crear varios directorios
temporales bajo `/var/cache/nginx/` (`client_temp`, `proxy_temp`,
`fastcgi_temp`, `uwsgi_temp`, `scgi_temp`), y con el filesystem raíz en solo
lectura esa escritura falla — el contenedor entra en `CrashLoopBackOff`.

Tienes dos soluciones:

### Opción A — Desactivar el switch (la más simple)

En el panel de **Seguridad** de la app, desactiva **Sistema de archivos de
solo lectura** y vuelve a desplegar. Es la opción más rápida si no necesitas
el hardening extra para tu proyecto.

### Opción B — Mantenerlo activado y redirigir nginx a `/tmp`

Toda App en Kubero ya trae montado un volumen escribible en `/tmp`
(`emptyDir`), sin configurar nada extra. Puedes aprovecharlo agregando un
archivo de configuración a tu imagen que redirija los directorios
temporales de nginx hacia ahí.

Crea `nginx-temp-paths.conf` junto a tu `Dockerfile`:

```
client_body_temp_path /tmp/client_temp;
proxy_temp_path /tmp/proxy_temp;
fastcgi_temp_path /tmp/fastcgi_temp;
uwsgi_temp_path /tmp/uwsgi_temp;
scgi_temp_path /tmp/scgi_temp;
```

Y cópialo dentro de `/etc/nginx/conf.d/` en el `Dockerfile` (nginx incluye
automáticamente todo archivo `.conf` de esa carpeta):

```dockerfile
FROM nginx:alpine

COPY nginx-temp-paths.conf /etc/nginx/conf.d/nginx-temp-paths.conf
COPY . /usr/share/nginx/html
```

Esta opción es más indicada si tu curso o proyecto exige mantener el
hardening de seguridad activo en todas las Apps.

## Limitaciones

Las opciones no cambian el usuario ni los permisos de archivos incluidos en la imagen. Una imagen que requiere root o escribir en rutas sin volumen puede fallar con estos ajustes. Los UID/GID aceptan números; las capacidades disponibles se eligen del listado del formulario. Las políticas del clúster también pueden rechazar una configuración.

Estos controles pertenecen al contenedor; no cambian los roles Profesor/Estudiante ni las membresías de [Equipos](../gestion-de-equipos.md).
