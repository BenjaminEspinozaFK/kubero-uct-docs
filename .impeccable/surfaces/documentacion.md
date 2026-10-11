# Documentación Kubero UCT

Modo: Read. Alcance: únicamente presentación visual de todas las rutas de VitePress. La autoridad visual es el DESIGN.md del proyecto hermano kubero, confirmado explícitamente por el usuario. Mantener intactos artículos, portada, textos, imágenes, enlaces, configuración y comportamiento.

Actualización solicitada: ampliar un 50% el ancho máximo exterior del panel (`calc(111ch + 123px)`) y mantener el encabezado con la misma geometría que la portada. El ancho efectivo se limita al espacio disponible en cada dispositivo. Esta decisión sustituye la medida de lectura original del contrato siguiente.

## Direction contract

THESIS: Un manual institucional integrado al centro de operaciones de Kubero; navegación compacta y lectura en un panel principal sobre un fondo técnico.

OWN-WORLD: Azul UCT, superficies F4F6F9/F7F9FC/blanco y 0E1620/0B1119/16202D; radios de 4–8px, bordes sutiles, tipografía de peso 600, terminales oscuras y estados semánticos.

STORY: El lector identifica su guía en el menú, reconoce la sección activa y consulta instrucciones, capturas y código sin perder la posición en el documento.

FIRST VIEWPORT: Encabezado institucional de 64px, menú lateral fijo de 272px en escritorio, panel de lectura de 65–75ch e índice lateral sobrio. Portada compacta con su título y acciones existentes, seguida inmediatamente de las guías. En móvil, menú desplegable y una columna sin reducir la tipografía.

FORM: Sistema existente fijado por el usuario; adaptación directa mediante CSS, sin generación ni selección de un mundo nuevo. Interacción distintiva: estados de navegación activa y foco que conservan el contexto del lector.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
