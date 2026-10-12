import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kubero UCT',
  description: 'Documentación de la plataforma CI/CD educativa con Kubero',
  lang: 'es',
  base: '/kubero-uct-docs/',
  markdown: {
    languageAlias: { env: 'dotenv' },
    config(md) {
      // Keep native table layout; scroll the surrounding region on small screens.
      md.renderer.rules.table_open = () =>
        '<div class="table-scroll" tabindex="0" role="region" aria-label="Tabla de documentación"><table>\n'
      md.renderer.rules.table_close = () => '</table></div>\n'
    },
  },

  themeConfig: {
    logo: { src: '/logouct-header.png', alt: 'Universidad Católica de Temuco, Facultad de Ingeniería' },
    siteTitle: 'Kubero UCT',

    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Guía', link: '/introduccion' },
    ],

    sidebar: [
      {
        text: 'Estudiantes',
        items: [
          { text: 'Introducción', link: '/introduccion' },
          { text: 'Primeros Pasos', link: '/primeros-pasos' },
          { text: 'Crear Pipeline y App', link: '/despliegue' },
          { text: 'Autodeploy', link: '/autodeploy' },
          { text: 'Base de Datos y Variables', link: '/base-de-datos' },
          { text: 'Routing y Monitoreo', link: '/routing-y-monitoreo' },
        ]
      },
      {
        text: 'Profesores',
        items: [
          { text: 'Gestión de Usuarios', link: '/profesores' },
          { text: 'Gestión de Equipos', link: '/gestion-de-equipos' },
        ],
      },
      {
        text: 'Extras',
        items: [
          { text: 'Autenticación Básica', link: '/extras/autenticacion-basica' },
          { text: 'Seguridad', link: '/extras/seguridad' },
          { text: 'Redes', link: '/extras/redes' },
          { text: 'CORS', link: '/extras/cors' },
          { text: 'Kubernetes', link: '/extras/kubernetes' },
          { text: 'Variables de Entorno', link: '/extras/variables-de-entorno' },
          { text: 'Recursos', link: '/extras/recursos' },
          { text: 'Volúmenes', link: '/extras/volumenes' },
          { text: 'Cronjobs', link: '/extras/cronjobs' },
          { text: 'Comprobaciones de Estado', link: '/extras/health-checks' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kubero-dev/kubero' }
    ],

    footer: {
      message: 'Documentación para la plataforma CI/CD de la UCT',
      copyright: 'Universidad Católica de Temuco'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: 'Buscar', buttonAriaLabel: 'Buscar en la documentación' },
              modal: {
                displayDetails: 'Mostrar detalles',
                resetButtonTitle: 'Borrar búsqueda',
                backButtonTitle: 'Cerrar búsqueda',
                noResultsText: 'Sin resultados para',
                footer: { selectText: 'seleccionar', navigateText: 'navegar', closeText: 'cerrar' },
              },
            },
          },
        },
      },
    },

    outline: {
      label: 'En esta página',
      level: [2, 3]
    },

    docFooter: {
      prev: 'Anterior',
      next: 'Siguiente'
    },

    darkModeSwitchLabel: 'Tema',
    lightModeSwitchTitle: 'Cambiar a modo claro',
    darkModeSwitchTitle: 'Cambiar a modo oscuro',
    sidebarMenuLabel: 'Menú',
    returnToTopLabel: 'Volver arriba',
    skipToContentLabel: 'Ir al contenido',
  }
})
