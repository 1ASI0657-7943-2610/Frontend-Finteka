<template>
  <div class="layout-container">
    <!-- Menú lateral izquierdo fijo. Escuchamos el evento toggle-notifs -->
    <Sidebar @toggle-notifs="showNotifs = !showNotifs" />

    <!-- Contenedor derecho (Barra superior + Contenido dinámico) -->
    <div class="main-content">
      <Topbar />

      <!-- Aquí Vue inyectará el Dashboard, Profesionales, etc. -->
      <main class="page-content">
        <!-- PANEL FLOTANTE DE NOTIFICACIONES -->
        <NotificationsPanel v-if="showNotifs" />

        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '../shared/components/sidebar.component.vue';
import Topbar from '../shared/components/topbar.component.vue';
import NotificationsPanel from '../notifications/components/notifications-panel.component.vue';

// Variable reactiva para mostrar/ocultar el panel
const showNotifs = ref(false);
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
}
.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.page-content {
  padding: 2rem;
  flex-grow: 1;
  background-color: #F4F7FE; /* Color exacto de Figma */
  position: relative; /* CRUCIAL: Para que el panel flotante se posicione respecto a esta caja */
}
</style>