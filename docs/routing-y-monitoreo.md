# Routing y Monitoreo

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

## Limitaciones Conocidas

Estas son limitaciones de la configuración actual de Kubero en la UCT que es importante conocer:

| Limitación | Descripción |
|---|---|
| **No hay build interno** | Kubero en la UCT no construye imágenes internamente. Siempre debes usar la estrategia "Container Image" con imágenes ya construidas en GitHub Actions y subidas a ghcr.io |
| **Dominio obligatorio** | Kubero requiere un dominio para todas las apps. Si no quieres exponer un servicio, igual debes ingresar un dominio (pero el servicio no tendrá ingress público si es un addon) |
| **Health checks en PostgreSQL** | Kubero activa health checks HTTP para todas las apps por defecto, lo que falla en servicios que no hablan HTTP (como PostgreSQL). Si el addon de postgres crashea, desactiva los health checks en la sección **HEALTH CHECKS** de la app |
| **Routing multi-servicio** | Si el frontend y el backend comparten el mismo dominio, el nginx del frontend debe estar configurado para hacer `proxy_pass` al servicio interno del backend. Esto debe hacerse en el `nginx.conf` de la imagen del frontend |
