<template>
  <div class="layout-container">
    <Sidebar @toggle-notifs="showNotifs = !showNotifs" />

    <div class="main-content">
      <Topbar />

      <div class="content-wrapper">

        <NotificationsPanel v-if="showNotifs" class="floating-notifs" />

        <main class="page-content">
          <router-view></router-view>
        </main>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '../shared/components/sidebar.component.vue';
import Topbar from '../shared/components/topbar.component.vue';
import NotificationsPanel from '../notifications/components/notifications-panel.component.vue';

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
.content-wrapper {
  flex-grow: 1;
  position: relative; /* Todo lo absoluto dentro de aquí tomará esto como límite */
  display: flex;
}
.page-content {
  padding: 2rem;
  flex-grow: 1;
  background-color: #F4F7FE;
  width: 100%;
}

/* LA CLAVE PARA QUE QUEDE PEgado AL BORDE IZQUIERDO */
.floating-notifs {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 100; /* Asegura que tape el dashboard */
  box-shadow: 4px 0 15px rgba(0,0,0,0.05); /* Sombra elegante */
}
</style>