# Primeros Pasos

## Acceder a Kubero

1. Abre tu navegador y ve a **`https://kubero.inf.uct.cl`**
2. Inicia sesión con las credenciales proporcionadas por el profesor.
3. Verás **Pipelines**, con los proyectos a los que tus equipos y permisos te dan acceso.
4. Usa la búsqueda y los filtros **Equipo**, **Fases activas** y **Origen** para encontrar el proyecto. Limpia los filtros si la lista parece vacía.

![Formulario actual de inicio de sesión de Kubero UCT](imagenes/login-actual.png)

![Lista actual de pipelines con filtros de equipos, fases y origen](imagenes/pipelines-actual.png)

::: warning Antes de crear el proyecto
El profesor debe agregarte al equipo de tu grupo o trabajo individual. Si no aparece en el selector de acceso del pipeline, consulta al profesor. Revisa [Gestión de equipos](gestion-de-equipos.md).
:::

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

      - name: Usar tu usuario en minúsculas
        id: owner
        run: echo "lc=${GITHUB_REPOSITORY_OWNER,,}" >> "$GITHUB_OUTPUT"

      - name: Build and push image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ steps.owner.outputs.lc }}/nombre-de-tu-imagen:latest
```

> Cambia `nombre-de-tu-imagen` por el nombre que quieras darle. Si tu proyecto tiene frontend y backend separados, necesitarás un job por cada uno apuntando al Dockerfile correspondiente.
>
> El paso "Usar tu usuario en minúsculas" es necesario porque ghcr.io exige que el nombre de la imagen sea todo en minúsculas — si tu usuario de GitHub tiene mayúsculas (ej. `TuUsuario`), el workflow falla con `repository name must be lowercase` sin este paso.

Después de hacer `git push`, GitHub Actions construirá y publicará la imagen automáticamente. Puedes ver el progreso en la pestaña **"Actions"** de tu repositorio.

![Workflow de GitHub Actions completado exitosamente](imagenes/03-actions-workflow-exitoso.png)

---

### Último paso — Hacer pública la imagen

En el flujo de estas guías, las imágenes en ghcr.io deben ser públicas para que el clúster pueda descargarlas sin credenciales adicionales. Publicar el repositorio no hace pública automáticamente su imagen.

1. Ve a `https://github.com/TU-USUARIO?tab=packages`
2. Haz clic en el nombre de la imagen
3. Ve a **"Package settings"** (esquina inferior derecha)
4. En la sección "Danger Zone", haz clic en **"Change visibility"** → **"Public"**
5. Repite para cada imagen del proyecto (frontend, backend, etc.)

![Package settings con opción de cambiar visibilidad a pública](imagenes/04-package-settings-visibilidad.png)
