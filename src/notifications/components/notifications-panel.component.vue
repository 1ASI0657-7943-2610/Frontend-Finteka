<template>
  <div class="notifications-panel">
    <div class="panel-header">
      <h2>Notificaciones</h2>
      <button class="mark-read" @click="marcarTodoLeido">Marcar todo como leído</button>
    </div>

    <div class="panel-tabs">
      <button
          class="tab"
          :class="{ active: activeTab === 'All' }"
          @click="activeTab = 'All'"
      >
        All <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>
      <button class="tab" :class="{ active: activeTab === 'Cita' }" @click="activeTab = 'Cita'">Citas</button>
      <button class="tab" :class="{ active: activeTab === 'Sistema' }" @click="activeTab = 'Sistema'">Sistema</button>
    </div>

    <div class="alert-banner">
      <span class="icon-lightning">⚡</span>
      <p>Se han identificado las horas pico del próximo viernes entre las 14:00 y las 18:00.</p>
    </div>

    <div class="notifications-list">

      <div v-if="filteredNotifications.length === 0" style="padding: 20px; text-align: center; color: #6b7280; font-size: 13px;">
        No tienes notificaciones en esta categoría.
      </div>

      <div v-for="notif in filteredNotifications" :key="notif.id" class="notif-item">
        <div class="notif-icon-container">
          {{ notif.type === 'Cita' ? '📅' : '🔔' }}
          <span v-if="!notif.read" class="red-dot" style="display:inline-block; width:8px; height:8px; background:red; border-radius:50%; margin-left:4px;"></span>
        </div>
        <div class="notif-content">
          <p>{{ notif.text }}</p>
          <span class="time">{{ notif.date }}</span>
        </div>
      </div>

    </div>

    <div class="panel-footer">
      <button class="view-more">Ver más</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const notifications = ref([]);
const activeTab = ref('All');

onMounted(() => {
  cargarNotificaciones();
});

const cargarNotificaciones = () => {
  const saved = JSON.parse(localStorage.getItem('finteka_notificaciones') || '[]');

  // Si está vacío, insertamos un par de notificaciones de prueba acordes a FinTeka
  if (saved.length === 0) {
    const defaults = [
      { id: 1, type: 'Cita', text: '¡Reserva confirmada! Tienes una asesoría en Finanzas con Maria.', date: 'Hoy, hace 2 min', read: false },
      { id: 2, type: 'Sistema', text: '¡Bienvenido a FinTeka! Explora nuestro directorio de expertos.', date: 'Ayer', read: true }
    ];
    localStorage.setItem('finteka_notificaciones', JSON.stringify(defaults));
    notifications.value = defaults;
  } else {
    notifications.value = saved;
  }
};

// Filtro para las pestañas
const filteredNotifications = computed(() => {
  if (activeTab.value === 'All') return notifications.value;
  return notifications.value.filter(n => n.type === activeTab.value);
});

// Contador de no leídas para la bolita negra (badge)
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

// Función para marcar como leídas
const marcarTodoLeido = () => {
  notifications.value.forEach(n => n.read = true);
  localStorage.setItem('finteka_notificaciones', JSON.stringify(notifications.value));
};
</script>

<style scoped>
/* TU CSS ORIGINAL INTACTO */
.notifications-panel { position: absolute; top: 20px; left: 20px; width: 480px; background: white; border: 1px solid #0097B2; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; display: flex; flex-direction: column; max-height: 80vh; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; }
.panel-header h2 { font-size: 16px; font-weight: 700; margin: 0; }
.mark-read { color: #0097B2; background: none; border: none; font-size: 12px; font-weight: 600; cursor: pointer; }
.panel-tabs { display: flex; gap: 15px; padding: 0 20px; border-bottom: 1px solid #E5E7EB; }
.tab { background: none; border: none; padding: 10px 0; font-size: 12px; font-weight: 600; color: #6B7280; cursor: pointer; }
.tab.active { color: #111; border-bottom: 2px solid #111; }
.badge { background: black; color: white; border-radius: 10px; padding: 2px 6px; font-size: 10px; margin-left: 4px; }
.alert-banner { display: flex; gap: 10px; padding: 12px 20px; background-color: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
.alert-banner p { font-size: 12px; color: #0097B2; margin: 0; font-weight: 500; }
.notifications-list { padding: 0 20px; overflow-y: auto; }
.date-group { font-size: 12px; color: #6B7280; margin: 15px 0 10px; font-weight: 600; }
.notif-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #E5E7EB; }
.notif-content p { font-size: 12px; font-weight: 600; color: #111; margin: 0 0 4px; line-height: 1.4; }
.notif-content .time { font-size: 11px; color: #9CA3AF; }
.panel-footer { padding: 15px; text-align: center; }
.view-more { color: #0097B2; background: none; border: none; font-weight: 700; font-size: 12px; cursor: pointer; }
</style>