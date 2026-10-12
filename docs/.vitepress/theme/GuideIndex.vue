<script setup lang="ts">
import { withBase } from 'vitepress'

const guides = [
  { title: 'Primeros pasos', description: 'Prepara tu repositorio y el flujo de construcción de imágenes.', link: '/primeros-pasos' },
  { title: 'Crear pipeline y app', description: 'Configura tu proyecto y despliega tu primera aplicación.', link: '/despliegue' },
  { title: 'Autodeploy', description: 'Conecta GitHub Actions con Kubero para automatizar los despliegues.', link: '/autodeploy' },
  { title: 'Base de datos y variables', description: 'Agrega PostgreSQL y configura las variables de tu aplicación.', link: '/base-de-datos' },
  { title: 'Routing y monitoreo', description: 'Consulta la configuración de red y los logs de tu aplicación.', link: '/routing-y-monitoreo' },
  { title: 'Gestión de usuarios', description: 'Consulta la guía de administración para profesores.', link: '/profesores' },
  { title: 'Gestión de equipos', description: 'Organiza el curso y asigna estudiantes y profesores a sus equipos.', link: '/gestion-de-equipos' },
  { title: 'Extras: configuración de aplicaciones', description: 'Consulta autenticación, seguridad, redes, CORS, Kubernetes, variables, recursos, volúmenes, cronjobs y comprobaciones de estado.', link: '/extras/autenticacion-basica' }
]
</script>

<template>
  <section class="guide-index" aria-labelledby="guide-title">
    <div class="guide-index__intro">
      <h2 id="guide-title">Del repositorio al despliegue</h2>
      <p>Consulta Estudiantes para desplegar, Profesores para gestionar el curso y Extras para configurar las aplicaciones.</p>
      <a :href="withBase('/introduccion.html')" class="guide-index__concepts">Conocer los conceptos de Kubero <span aria-hidden="true">→</span></a>
    </div>
    <ul class="guide-index__list">
      <li v-for="guide in guides" :key="guide.link">
        <a :href="withBase(`${guide.link}.html`)">
          <div><h3>{{ guide.title }}</h3><p>{{ guide.description }}</p></div>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
        </a>
      </li>
    </ul>
  </section>
  <section class="platform-notes" aria-labelledby="platform-title">
    <h2 id="platform-title">La plataforma se encarga de la infraestructura</h2>
    <dl>
      <div><dt>Dominios y HTTPS</dt><dd>Configura el dominio de tu aplicación y activa SSL para publicar su acceso mediante HTTPS.</dd></div>
      <div><dt>Base de datos</dt><dd>Configura PostgreSQL desde los complementos de la aplicación y conecta tu backend mediante su servicio interno.</dd></div>
      <div><dt>Logs en tiempo real</dt><dd>Visualiza la salida de tu aplicación en vivo desde el dashboard para diagnosticar errores rápidamente.</dd></div>
    </dl>
  </section>
</template>
