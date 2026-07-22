# Introducción

> **Plataforma:** `https://kubero.inf.uct.cl`
> **¿Qué es esto?** Una plataforma que transforma tu `git push` en una aplicación en vivo con URL pública y HTTPS, sin que tengas que tocar servidores ni configurar infraestructura.

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
