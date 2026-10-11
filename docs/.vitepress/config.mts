import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kubero UCT',
  description: 'Documentación de la plataforma CI/CD educativa con Kubero',
  lang: 'es',
  base: '/kubero-uct-docs/',
  markdown: {
    languageAlias: { env: 'dotenv' },
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
        text: 'Plataforma Kubero UCT',
        items: [
          { text: 'Introducción', link: '/introduccion' },
          { text: 'Primeros Pasos', link: '/primeros-pasos' },
          { text: 'Crear Pipeline y App', link: '/despliegue' },
          { text: 'Autodeploy', link: '/autodeploy' },
          { text: 'Base de Datos y Variables', link: '/base-de-datos' },
          { text: 'Routing y Monitoreo', link: '/routing-y-monitoreo' },
          { text: 'Gestión de Usuarios', link: '/profesores' },
        ]
      }
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
