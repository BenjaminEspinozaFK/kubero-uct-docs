import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kubero UCT',
  description: 'Documentación de la plataforma CI/CD educativa con Kubero',
  lang: 'es',

  themeConfig: {
    logo: '/kubero-logo.svg',
    siteTitle: 'Kubero UCT',

    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Guía', link: '/guia' },
    ],

    sidebar: [
      {
        text: 'Plataforma Kubero UCT',
        items: [
          { text: 'Conceptos Clave', link: '/guia#conceptos-clave' },
          { text: '¿Cómo funciona?', link: '/guia#cómo-funciona' },
          { text: 'Roles en la Plataforma', link: '/guia#roles-en-la-plataforma' },
          { text: 'Acceder a Kubero', link: '/guia#acceder-a-kubero' },
          { text: 'Preparar tu Repositorio', link: '/guia#preparar-tu-repositorio-en-github' },
          { text: 'Crear un Pipeline', link: '/guia#crear-un-pipeline' },
          { text: 'Crear una App', link: '/guia#crear-una-app-y-hacer-tu-primer-despliegue' },
          { text: 'Autodeploy', link: '/guia#autodeploy-redespliegue-automático' },
          { text: 'Base de Datos (PostgreSQL)', link: '/guia#agregar-una-base-de-datos-addon-postgresql' },
          { text: 'Variables de Entorno', link: '/guia#variables-de-entorno' },
          { text: 'Routing Frontend + Backend', link: '/guia#routing-entre-servicios-frontend--backend' },
          { text: 'Monitorear tu Despliegue', link: '/guia#monitorear-tu-despliegue' },
          { text: 'Gestión de Usuarios', link: '/guia#gestión-de-usuarios-solo-profesores' },
          { text: 'Limitaciones Conocidas', link: '/guia#limitaciones-conocidas' },
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
      provider: 'local'
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
  }
})
