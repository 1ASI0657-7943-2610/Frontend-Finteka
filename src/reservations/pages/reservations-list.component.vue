<template>
  <div class="reservations-container">
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
            <div class="status-pill confirmada">{{ res.status }}</div>
            <button class="btn-join" @click="joinMeeting(res.expertName)">Unirse a sesión</button>
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
const isLoading = ref(true); // Control de la pantalla de carga

const femaleNames = ['mia', 'maria', 'ana', 'sofia', 'lucia', 'castillo', 'carmen', 'natalia', 'valeria', 'elena', 'laura', 'sara'];

const getPhoto = (name = '') => {
  return femaleNames.some(f => name.toLowerCase().includes(f)) ? womanAvatar : manAvatar;
};

onMounted(async () => {
  isLoading.value = true;
  try {
    // Pedimos profesionales y reservas AL MISMO TIEMPO para máxima velocidad
    const [profResponse, resResponse] = await Promise.all([
      http.get('/api/professionals'),
      http.get('/api/reservations')
    ]);

    const professionals = profResponse.data;
    const backendReservations = resResponse.data;

    // Ordenamos para que las reservas más nuevas (ID más alto) aparezcan arriba
    backendReservations.sort((a, b) => b.id - a.id);

    myReservations.value = backendReservations.map(res => {
      const prof = professionals.find(p => p.id === res.professionalId) || {};
      const expertName = prof.name || `Experto #${res.professionalId}`;
      const specialty = prof.specialty || prof.occupation || 'Consultoría';

      // Captura flexible de la fecha, sin importar si viene como timeslot, timeSlot o startTime
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
    console.error("Error consultando la base de datos de Azure:", error);
    const saved = JSON.parse(localStorage.getItem('finteka_reservas') || '[]');
    myReservations.value = saved.map(res => ({
      ...res,
      expertPhoto: getPhoto(res.expertName)
    }));
  } finally {
    isLoading.value = false; // Oculta la pantalla de carga al terminar
  }
});

const joinMeeting = (expertName) => {
  const meetLink = 'https://meet.google.com/abc-mxyz-pqr';
  window.open(meetLink, '_blank');
};
</script>

<style scoped>
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
.btn-join { background: #0097B2; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; width: 100%; }
.btn-join:hover { background: #007A8F; }

.empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 16px; border: 1px dashed #D1D5DB; }
.empty-state h3 { color: #4B5563; margin-bottom: 15px; }
.btn-explore { background: #1F2937; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; }
</style>