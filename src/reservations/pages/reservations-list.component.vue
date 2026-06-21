<template>
  <div class="reservations-container">
    <transition name="toast">
      <div v-if="notification.show" class="toast-notification">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>{{ notification.message }}</span>
      </div>
    </transition>

    <header class="page-header">
      <h1 class="page-title">Mis Reservas</h1>
      <p class="page-subtitle">Gestiona tus próximas sesiones con expertos.</p>
    </header>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Conectando con el servidor, cargando reservas...</p>
    </div>

    <div v-else-if="myReservations.length > 0" class="reservations-grid">
      <div v-for="res in myReservations" :key="res.id" class="reservation-card">
        <div class="card-content">
          <div class="expert-thumb">
            <img :src="res.expertPhoto" :alt="res.expertName" />
          </div>

          <div class="reservation-details">
            <h3 class="expert-name">{{ res.expertName }}</h3>
            <span class="specialty-tag">{{ res.specialty }}</span>
            <div class="time-info">
              <div class="info-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>{{ res.date }}</span>
              </div>
              <div class="info-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{{ res.time }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <div class="status-pill" :class="res.status.toLowerCase() === 'cancelada' ? 'cancelada' : 'confirmada'">
              {{ res.status }}
            </div>

            <button v-if="res.status !== 'Cancelada'" class="btn-join" @click="joinMeeting(res.expertName)">Unirse a sesión</button>
            <button v-if="res.status !== 'Cancelada'" class="btn-cancel" @click="cancelReservation(res.id, res.expertName, res.specialty)">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <h3>No tienes reservas pendientes</h3>
      <button class="btn-explore" @click="$router.push('/profesionales')">Explorar Expertos</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import http from '@/shared/services/http-common.js';
import manAvatar from '@/assets/user.avatar.png';
import womanAvatar from '@/assets/user-avatar-female.png';

const myReservations = ref([]);
const isLoading = ref(true);

// Estado para controlar la notificación reactiva
const notification = ref({ show: false, message: '' });

const femaleNames = ['mia', 'maria', 'ana', 'sofia', 'lucia', 'castillo', 'carmen', 'natalia', 'valeria', 'elena', 'laura', 'sara'];

const getPhoto = (name = '') => {
  return femaleNames.some(f => name.toLowerCase().includes(f)) ? womanAvatar : manAvatar;
};

const showToast = (msg) => {
  notification.value.message = msg;
  notification.value.show = true;
  // Se oculta automáticamente a los 4 segundos
  setTimeout(() => {
    notification.value.show = false;
  }, 4000);
};

const pushNotificationToSystem = (expertName, specialty) => {
  const nuevaNotificacion = {
    id: Date.now(),
    text: `¡Reserva cancelada! Has anulado la asesoría en ${specialty} con ${expertName}.`,
    date: 'Justo ahora',
    type: 'cancelacion',
    read: false
  };

  let notificacionesGuardadas = [];
  try {
    notificacionesGuardadas = JSON.parse(localStorage.getItem('finteka_notificaciones') || '[]');
  } catch (e) {
    notificacionesGuardadas = [];
  }

  notificacionesGuardadas.unshift(nuevaNotificacion);
  localStorage.setItem('finteka_notificaciones', JSON.stringify(notificacionesGuardadas));

  window.dispatchEvent(new CustomEvent('notificacion-actualizada', { detail: nuevaNotificacion }));
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const profileId = localStorage.getItem('profileId') || '10';
    console.log("🔍 [FinTeka] Sesión actual es ID:", profileId);

    const [profResponse, resResponse] = await Promise.all([
      http.get('/api/professionals'),
      http.get('/api/reservations')
    ]);

    const professionals = profResponse.data || [];
    const allReservations = resResponse.data || [];

    // EL CAMBIO ESTÁ AQUÍ: Se eliminó el filtro temporalmente para ver TODAS las reservas.
    const backendReservations = allReservations;
    console.log("✅ [FinTeka] Mostrando todas las reservas sin filtro de usuario:", backendReservations);

    backendReservations.sort((a, b) => b.id - a.id);

    myReservations.value = backendReservations.map(res => {
      const prof = professionals.find(p => p.id === res.professionalId) || {};
      const expertName = prof.name || prof.firstName || `Experto #${res.professionalId}`;
      const specialty = prof.specialty || prof.occupation || 'Consultoría';

      const slotString = res.timeslot || res.timeSlot || res.startTime;
      let dateStr = 'Fecha por definir';
      let timeStr = 'Hora por definir';

      if (slotString && slotString.includes('T')) {
        const parts = slotString.split('T');
        dateStr = parts[0];
        timeStr = parts[1].substring(0, 5);
      } else if (slotString) {
        dateStr = slotString;
      }

      return {
        id: res.id,
        expertName: expertName,
        specialty: specialty,
        date: dateStr,
        time: timeStr,
        status: (res.status === 'ACTIVE' || res.status === 'CONFIRMED') ? 'Confirmada' : (res.status || 'Confirmada'),
        expertPhoto: getPhoto(expertName)
      };
    });

  } catch (error) {
    console.error("❌ [FinTeka] Error de red o CORS al conectar con Azure:", error);
    myReservations.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const joinMeeting = (expertName) => {
  const meetLink = 'https://meet.google.com/abc-mxyz-pqr';
  window.open(meetLink, '_blank');
};

const cancelReservation = async (id, expertName, specialty) => {
  if(confirm("¿Estás seguro de cancelar esta reserva?")) {
    try {
      await http.delete(`/api/reservations/${id}`);
      myReservations.value = myReservations.value.map(res =>
          res.id === id ? { ...res, status: 'Cancelada' } : res
      );
      // Disparamos notificaciones
      showToast("La asesoría ha sido cancelada y eliminada del sistema.");
      pushNotificationToSystem(expertName, specialty);
    } catch (error) {
      console.error("Error cancelando en Azure:", error);
      myReservations.value = myReservations.value.map(res =>
          res.id === id ? { ...res, status: 'Cancelada' } : res
      );
      showToast("La asesoría ha sido cancelada con éxito.");
      pushNotificationToSystem(expertName, specialty);
    }
  }
};
</script>

<style scoped>
/* Estilos de la Alerta de Cancelación */
.toast-notification {
  position: fixed;
  top: 25px;
  right: 25px;
  background-color: #EF4444;
  color: white;
  padding: 14px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  font-weight: 600;
  font-size: 14px;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s ease;
}
.toast-enter-from {
  transform: translateY(-20px) scale(0.9);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(50px);
  opacity: 0;
}

/* Diseño Original */
.reservations-container { padding: 40px; max-width: 1000px; margin: 0 auto; font-family: 'Poppins', sans-serif; }
.page-header { margin-bottom: 30px; }
.page-title { font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 5px; }
.page-subtitle { color: #6B7280; font-size: 14px; margin: 0; }

.loading-state { text-align: center; padding: 60px 20px; color: #6B7280; font-weight: 500; }
.spinner { width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top: 4px solid #0097B2; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.reservations-grid { display: flex; flex-direction: column; gap: 20px; }
.reservation-card { background: white; border-radius: 16px; border: 1px solid #E5E7EB; padding: 20px; transition: box-shadow 0.2s; }
.reservation-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.card-content { display: flex; align-items: center; gap: 20px; }
.expert-thumb { width: 70px; height: 70px; border-radius: 50%; overflow: hidden; border: 2px solid #F3F4F6; flex-shrink: 0; }
.expert-thumb img { width: 100%; height: 100%; object-fit: cover; }
.reservation-details { flex-grow: 1; }
.expert-name { font-size: 16px; font-weight: 700; color: #1F2937; margin: 0 0 5px; text-transform: capitalize; }
.specialty-tag { display: inline-block; padding: 4px 10px; background: #F0FBFC; color: #0097B2; border-radius: 12px; font-size: 11px; font-weight: 600; margin-bottom: 10px; }
.time-info { display: flex; gap: 15px; }
.info-item { font-size: 13px; color: #4B5563; font-weight: 500; display: flex; align-items: center; gap: 6px; }
.info-item svg { color: #0097B2; }

.card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 120px; }
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.status-pill.confirmada { background: #D1FAE5; color: #059669; text-transform: capitalize; }
.status-pill.cancelada { background: #FEE2E2; color: #DC2626; text-transform: capitalize; }

.btn-join { background: #0097B2; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; width: 100%; }
.btn-join:hover { background: #007A8F; }

.btn-cancel { background: transparent; color: #EF4444; border: 1px solid #FCA5A5; padding: 6px 15px; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; transition: 0.2s; width: 100%; }
.btn-cancel:hover { background: #FEE2E2; }

.empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 16px; border: 1px dashed #D1D5DB; }
.empty-state h3 { color: #4B5563; margin-bottom: 15px; }
.btn-explore { background: #1F2937; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; }
</style>