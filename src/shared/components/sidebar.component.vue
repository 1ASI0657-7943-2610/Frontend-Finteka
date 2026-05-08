<template>
  <aside class="sidebar">
    <div class="logo-container">
      <h1 class="logo">Fin<span>Teka</span></h1>
    </div>

    <nav class="nav-menu">
      <router-link to="/dashboard" class="nav-item" active-class="active">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        Inicio
      </router-link>

      <router-link to="/profesionales" class="nav-item" active-class="active">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        Profesionales
      </router-link>

      <a href="#" @click.prevent="$emit('toggle-notifs')" class="nav-item">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        Notificaciones
      </a>

      <router-link to="/mensajes" class="nav-item" active-class="active">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Mensajes
      </router-link>

      <router-link to="/reservas" class="nav-item" active-class="active">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        Reservas
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
// Declaramos que este componente puede emitir el evento 'toggle-notifs'
defineEmits(['toggle-notifs']);
</script>

<style scoped>
/* Tu CSS intacto */
.sidebar {
  width: 280px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid #E5E7EB;
}
.logo-container { padding: 40px 32px; }
.logo { font-family: 'Poppins', sans-serif; font-size: 32px; font-weight: 700; color: #1F2937; margin: 0; letter-spacing: -0.5px; }
.logo span { color: #0097B2; }
.nav-menu { display: flex; flex-direction: column; padding: 0 16px; gap: 8px; }
.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  text-decoration: none;
  color: #6B7280;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 15px;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.icon { width: 20px; height: 20px; margin-right: 16px; stroke: currentColor; }
.nav-item.active { background-color: #E6F5F8; color: #0097B2; }
.nav-item.active .icon { stroke: #0097B2; }
.nav-item:hover:not(.active) { background-color: #F9FAFB; color: #1F2937; }
</style>