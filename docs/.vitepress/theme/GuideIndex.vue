<script setup lang="ts">
import { withBase } from 'vitepress'

const guides = [
  { title: 'Primeros pasos', description: 'Accede a Kubero y confirma que tienes tu equipo asignado.', link: '/primeros-pasos' },
  { title: 'Crear pipeline, apps, base de datos, variables, routing y monitoreo', description: 'Prepara el repositorio y las imágenes, despliega las apps y configura su base de datos, conexiones y monitoreo.', link: '/despliegue' },
  { title: 'Autodeploy', description: 'Conecta GitHub Actions con Kubero para automatizar los despliegues.', link: '/autodeploy' },
  { title: 'Gestión de equipos y usuarios', description: 'Crea los equipos del curso y luego las cuentas con su equipo asignado.', link: '/profesores' },
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
