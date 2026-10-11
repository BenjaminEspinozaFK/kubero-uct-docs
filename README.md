# Documentación Kubero UCT

Sitio de documentación en español para la plataforma CI/CD educativa de la Universidad Católica de Temuco. Incluye guías para preparar repositorios, desplegar aplicaciones, automatizar despliegues y administrar proyectos en Kubero.

Construido con **VitePress 1.6.4**, con búsqueda local, navegación entre guías y un tema institucional que admite modos claro y oscuro.

La plataforma está disponible en [kubero.inf.uct.cl](https://kubero.inf.uct.cl).

## Desarrollo local

Utiliza **Node.js 22** y **npm**, las mismas herramientas configuradas en el flujo de publicación del repositorio.

Desde la raíz del proyecto, instala las dependencias y levanta el servidor de desarrollo:

```bash
npm ci
npm run docs:dev
```

Abre la dirección que muestra la terminal. El puerto habitual es `5173` y la documentación utiliza el prefijo `/kubero-uct-docs/`:

```text
http://localhost:5173/kubero-uct-docs/
```

Los cambios en las guías y el tema se reflejan durante el desarrollo.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm ci` | Instalar las versiones registradas en `package-lock.json`. |
| `npm run docs:dev` | Iniciar el servidor de desarrollo. |
| `npm run docs:build` | Compilar el sitio estático en `docs/.vitepress/dist/`. |
| `npm run docs:preview` | Servir localmente la última compilación. |

Para revisar la versión de producción, compila antes de iniciar la vista previa:

```bash
npm run docs:build
npm run docs:preview
```

## Guías disponibles

| Guía | Contenido |
| --- | --- |
| [Introducción](docs/introduccion.md) | Conceptos de la plataforma, flujo de despliegue y roles. |
| [Primeros pasos](docs/primeros-pasos.md) | Acceso, preparación del repositorio y construcción de imágenes. |
| [Crear pipeline y app](docs/despliegue.md) | Configuración y primer despliegue de una aplicación. |
| [Autodeploy](docs/autodeploy.md) | Automatización de redespliegues con GitHub Actions. |
| [Base de datos y variables](docs/base-de-datos.md) | PostgreSQL, servicios internos y variables de entorno. |
| [Routing y monitoreo](docs/routing-y-monitoreo.md) | Conexión entre servicios, logs y resolución de errores. |
| [Gestión de usuarios](docs/profesores.md) | Administración de estudiantes y proyectos para profesores. |

## Estructura

```text
.
├── .github/workflows/deploy.yml   # Publicación en GitHub Pages
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts            # Configuración, navegación y búsqueda
│   │   └── theme/
│   │       ├── index.ts          # Registro del tema y componentes
│   │       ├── GuideIndex.vue    # Índice de guías de la portada
│   │       ├── style.css         # Tokens y estilos base
│   │       └── institutional.css # Presentación institucional UCT
│   ├── imagenes/                # Capturas utilizadas en las guías
│   ├── public/                  # Activos estáticos, incluido el logotipo
│   └── *.md                     # Portada y artículos
├── DESIGN.md                    # Sistema de diseño de la documentación
├── package.json
└── package-lock.json
```

## Actualizar la documentación

1. Edita el artículo correspondiente en `docs/` o crea un archivo Markdown nuevo.
2. Guarda las capturas en `docs/imagenes/` y agrega texto alternativo descriptivo.
3. Si agregas una guía, incorpora su enlace en el `sidebar` de `docs/.vitepress/config.mts`. Actualiza también `GuideIndex.vue` si debe aparecer en la portada.
4. Revisa el resultado en desarrollo, tanto en escritorio como en móvil y en ambos temas.
5. Ejecuta `npm run docs:build` para comprobar enlaces y generación del sitio antes de publicar.

El tema sigue la identidad visual de Kubero UCT descrita en [DESIGN.md](DESIGN.md). Mantén los colores y estilos compartidos en los archivos del tema. Las tablas tienen un contenedor con desplazamiento horizontal para pantallas pequeñas; el código adapta el fondo y el resaltado al tema seleccionado.

## Publicación

El flujo [Deploy Docs to GitHub Pages](.github/workflows/deploy.yml) se ejecuta con cada push a `main` y también permite ejecución manual mediante `workflow_dispatch`.

El flujo instala dependencias con `npm ci`, compila el sitio y publica el contenido de `docs/.vitepress/dist/` en GitHub Pages. El repositorio debe tener Pages configurado para usar **GitHub Actions**.

La configuración actual utiliza `base: '/kubero-uct-docs/'`. Si cambia el nombre del repositorio o se publica bajo otra ruta, ajusta ese valor en `docs/.vitepress/config.mts` y revisa los enlaces y activos en la compilación resultante.

Las carpetas `node_modules/`, `docs/.vitepress/dist/` y `docs/.vitepress/cache/` se generan localmente y están excluidas de Git.
