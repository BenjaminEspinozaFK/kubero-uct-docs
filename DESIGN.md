---
name: "Documentación Kubero UCT"
description: "Manual institucional de lectura integrado a la identidad operativa de Kubero UCT."
colors:
  primary: "#0075B4"
  primary-hover: "#005888"
  primary-dark-theme: "#0090DC"
  primary-hover-dark-theme: "#38B4F4"
  primary-soft-light: "rgba(0, 117, 180, .1)"
  primary-soft-dark: "rgba(0, 144, 220, .14)"
  workspace-light: "#F4F6F9"
  navigation-light: "#F7F9FC"
  panel-light: "#FFFFFF"
  secondary-light: "#EAEFF5"
  workspace-dark: "#0E1620"
  navigation-dark: "#0B1119"
  panel-dark: "#16202D"
  secondary-dark: "#1B2430"
  text-light: "#1A1A1A"
  text-dark: "#E2E8F0"
  muted-light: "#526073"
  muted-dark: "#A7B5C8"
  tertiary-text-light: "#647185"
  tertiary-text-dark: "#93A4BA"
  border-light: "#C8D2DE"
  border-dark: "#344357"
  subtle-border: "rgba(135, 135, 135, .2)"
  warning-light: "#7A6400"
  warning-dark: "#EDC500"
  danger-light: "#B42332"
  danger-dark: "#FF8790"
  success-light: "#047857"
  success-dark: "#6EE7B7"
typography:
  display:
    fontFamily: "Vista Sans, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-.02em"
  headline:
    fontFamily: "Vista Sans, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-.02em"
  title:
    fontFamily: "Vista Sans, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-.01em"
  body:
    fontFamily: "Vista Sans, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Vista Sans, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: ".05em"
  code:
    fontFamily: "Fira Code, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.75
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  dialog: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  inset: "20px"
  xl: "24px"
  panel: "32px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.panel-light}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.panel-light}"
  reading-panel-light:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.text-light}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "32px 40px"
    width: "calc(111ch + 123px)"
  reading-panel-dark:
    backgroundColor: "{colors.panel-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "32px 40px"
    width: "calc(111ch + 123px)"
  navigation-item:
    rounded: "{rounded.sm}"
    padding: "5px 12px"
  code-block:
    backgroundColor: "{colors.navigation-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "20px 24px"
---

# Design System: Documentación Kubero UCT

## Overview

**Creative North Star: "Manual institucional del centro de operaciones".** La documentación adapta la identidad de Kubero UCT a una superficie de lectura en VitePress: navegación compacta, panel principal definido y guías fáciles de recorrer. La voz visual es sobria, institucional y técnica, con densidad suficiente para conservar contexto sin comprimir las instrucciones.

La autoridad visual es `../kubero/DESIGN.md`, apoyada por `../kubero/PRODUCT.md`, `../kubero/client/src/styles/uct-theme.scss` y el activo institucional `client/src/assets/logouct-header.png` del proyecto hermano. El contrato local es `.impeccable/surfaces/documentacion.md`. Esta actualización fusiona las notas anteriores con el rediseño autorizado; describe la implementación en `docs/.vitepress/theme/style.css` e `institutional.css`, importadas por `index.ts`.

**Key Characteristics:**

- Azul UCT y superficies equivalentes en temas claro y oscuro.
- Lectura de 16px, paneles tonales y jerarquía contenida.
- Navegación activa y foco visibles, código oscuro y capturas existentes.
- Reutilización de controles VitePress, artículos, textos, rutas y comportamiento.

## Colors

### Primary

El azul institucional identifica enlaces, secciones y navegación activa: `primary` en claro y `primary-dark-theme` en oscuro. El hover de enlaces usa el rol correspondiente; los botones principales conservan el azul claro con hover profundo en ambos temas. Los fondos azules de baja opacidad acompañan selección y hover sin competir con el contenido.

### Neutral

Cada tema distingue fondo de trabajo (`workspace`), navegación (`navigation`), panel de lectura (`panel`) y relleno secundario (`secondary`). El panel claro es blanco y el oscuro es azul pizarra; sidebar y pie usan el rol de navegación. Texto, texto secundario y bordes cambian con el tema. `muted-dark` también identifica lenguaje, números de línea y comentarios de código sobre el fondo de consola.

Advertencias, errores y éxito conservan semántica de estado; no son acentos decorativos. Los valores del frontmatter son normativos para esta adaptación, incluidos ajustes de contraste respecto a la aplicación.

## Typography

La familia de interfaz es Vista Sans, Roboto y respaldos del sistema; el código usa Fira Code, SFMono-Regular, Menlo, Consolas y monospace. Son pilas de preferencia, no fuentes empaquetadas: no hay archivos Vista Sans ni Fira Code incorporados, ni descargas externas de fuentes.

- **Display:** portada, 32px/1.3, peso 600; 26px en móvil.
- **Headline:** h1 del artículo, 26px/1.35, peso 600; 24px en móvil.
- **Title:** h2, 20px/1.4, peso 600. h3 usa 17px/1.5 y h4 16px.
- **Body:** 16px/1.75; navegación y tablas usan 14px, avisos y citas 15px.
- **Label:** grupos del menú e índice, 12px, peso 600 y espaciado .05em; mayúsculas solo en esas etiquetas.
- **Code:** bloques de 13px/1.75 y peso 500; código en línea a .85em.

## Layout

El encabezado conserva exactamente la geometría de la portada en las guías: mismo logotipo, título, buscador y enlaces, sin desplazamientos al activar el menú lateral. El ancho máximo del panel de documentación es 1.5 veces el original; en pantallas pequeñas se limita al espacio disponible sin generar scroll horizontal de página.

El fondo del encabezado es opaco y usa `panel` en todo su ancho, también en páginas con sidebar. La cortina del menú lateral no debe aparecer detrás del logotipo; el separador inferior del encabezado recorre el ancho completo.

Encabezado de 64px y sidebar de 272px en escritorio, dentro de un ancho máximo de 1536px. El artículo se lee en un panel con **ancho máximo ampliado un 50% respecto del panel original**: su ancho exterior es `calc(111ch + 123px)`, con 40px de padding por lado y bordes de 1px, limitado al espacio disponible. El índice lateral aparece desde 1280px; la navegación de escritorio desde 960px.

Ritmo de 4–8px con separación habitual de 16–24px y secciones de 40px. El panel usa padding 32px 40px; bajo 960px, 28px 32px; bajo 768px, 24px 20px. La portada conserva sus títulos, acciones y enlaces existentes dentro de paneles de hasta 1120px. El índice de guías pasa de dos columnas a una en móvil.

Las tablas mantienen scroll horizontal interno y celdas móviles de al menos 144px. Los identificadores dentro de tablas conservan el ajuste normal de palabra para evitar fragmentarlos; el código en línea fuera de tablas puede envolver identificadores largos. Bloques de código conservan desplazamiento propio. No reducir la escala del cuerpo para encajar datos.

## Elevation & Depth

La profundidad ordinaria se expresa mediante superficies tonales y bordes de 1px; los paneles de lectura no usan sombras. La búsqueda, como superficie temporal, usa `0 16px 48px rgba(14, 22, 32, .24)`. Mantener la elevación reservada a planos que capturan atención temporalmente.

## Shapes

Curvas contenidas: 8px en paneles, botones, citas, avisos, tablas, capturas y bloques de código; 6px en entradas de navegación y controles de copia; 4px en código en línea e índice lateral; 12px en el diálogo de búsqueda. El logotipo conserva proporciones y las capturas mantienen tamaño adaptable y altura automática.

## Components

### Buttons

Acciones de portada de 44px, texto de 14px y peso 600, padding horizontal de 16px y radio de 8px. Una acción principal azul convive con una alternativa tonal. Hover por color, sin desplazamiento ornamental.

### Cards / Containers

El panel de lectura, la portada y el índice de guías comparten superficie de tema, borde sutil y radio de 8px. El índice lateral usa padding de 16px. Las capturas existentes se presentan con padding de 8px y fondo de navegación, sin alterar el raster.

### Navigation

Menú lateral compacto con filas de al menos 40px, texto de 14px, hover tonal y selección azul suave con peso 600. El índice lateral combina fondo activo y color de enlace. En móvil se conservan los controles desplegables de VitePress.

### Search

Búsqueda local sobre panel de tema, borde visible en el campo y selección azul suave en resultados. Se conserva el flujo y la interacción de VitePress.

### Technical content

Código sobre `navigation-dark` en ambos temas; comentarios corregidos a `#A7B5C8` para lectura sobre consola. Tablas con encabezados tonales, filas alternas y separadores discretos. Citas y avisos usan paneles compactos; el estado conserva texto además de color.

### Accessibility

Foco de teclado con contorno de 3px azul y separación de 2px. Las tablas desplazables pueden recibir foco para recorrer su contenido. Las transiciones de botón y enlaces de guía duran 140ms con `ease-out`; con movimiento reducido se desactivan transiciones y animaciones y el desplazamiento es inmediato.

## Do's and Don'ts

### Do:

- **Do** mantener roles de color para ambos temas, medida interior de lectura y escala del cuerpo.
- **Do** preservar navegación por teclado, foco visible y movimiento reducido.
- **Do** conservar artículos, capturas, textos, rutas y comportamiento; los enlaces existentes de portada incluyen `.html` para alojamiento estático con prefijo.
- **Do** conservar proporciones y texto alternativo del logotipo institucional.
- **Do** reutilizar los rasters existentes: no se produjeron ni copiaron nuevos activos en este rediseño; todos los rasters publicados son previos y permanecen intactos.

### Don't:

- **Don't** reintroducir el morado histórico de Kubero como acento institucional.
- **Don't** usar amarillo, verde o rojo como decoración, ni sombras en cada panel.
- **Don't** añadir emojis o ilustraciones decorativas a la portada de acceso a guías.
- **Don't** reducir texto para encajar tablas, fragmentar identificadores de tabla o atribuir fuentes empaquetadas a estas pilas de respaldo.
