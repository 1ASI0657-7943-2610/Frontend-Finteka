<template>
  <div class="reservations-container">
    <header class="page-header">
      <h1 class="page-title">Mis Reservas</h1>
      <p class="page-subtitle">Gestiona tus próximas sesiones con expertos.</p>
    </header>

    <!-- Solo mostramos la cuadrícula si hay algo en tu memoria local -->
    <div v-if="myReservations.length > 0" class="reservations-grid">
      <div v-for="res in myReservations" :key="res.id" class="reservation-card">
        <div class="card-content">
          <div class="expert-thumb">
            <img :src="res.expertPhoto" :alt="res.expertName" />
          </div>

          <div class="reservation-details">
            <h3 class="expert-name">{{ res.expertName }}</h3>
            <span class="specialty-tag">{{ res.specialty }}</span>
            <div class="time-info">
              <div class="info-item"><span>{{ res.date }}</span></div>
              <div class="info-item"><span>{{ res.time }}</span></div>
            </div>
          </div>

          <div class="card-actions">
            <div class="status-pill confirmada">Confirmada</div>
            <!-- AQUÍ ESTÁ EL BOTÓN ACTUALIZADO -->
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
import manAvatar from '@/assets/user.avatar.png';
import womanAvatar from '@/assets/user-avatar-female.png';

const myReservations = ref([]);

const femaleNames = ['mia', 'maria', 'ana', 'sofia', 'lucia', 'castillo', 'carmen', 'natalia', 'valeria', 'elena'];

const getPhoto = (name = '') => {
  return femaleNames.some(f => name.toLowerCase().includes(f)) ? womanAvatar : manAvatar;
};

onMounted(() => {
  // Leemos las reservas desde la memoria local
  const saved = JSON.parse(localStorage.getItem('finteka_reservas') || '[]');

  myReservations.value = saved.map(res => ({
    ...res,
    expertPhoto: getPhoto(res.expertName)
  }));
});

// NUEVA FUNCIÓN: Abre una pestaña de Google Meet
const joinMeeting = (expertName) => {
  // Generamos un enlace simulado de Google Meet
  const meetLink = 'https://meet.google.com/abc-mxyz-pqr';

  // Abrimos el enlace en una nueva pestaña del navegador
  window.open(meetLink, '_blank');
};
</script>

<style scoped>
.reservations-container { padding: 40px; max-width: 1000px; margin: 0 auto; font-family: 'Poppins', sans-serif; }
.page-header { margin-bottom: 30px; }
.page-title { font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 5px; }
.page-subtitle { color: #6B7280; font-size: 14px; margin: 0; }
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
.info-item { font-size: 13px; color: #4B5563; font-weight: 500; display: flex; align-items: center; gap: 5px; }
.card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 120px; }
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.status-pill.confirmada { background: #D1FAE5; color: #059669; }
.btn-join { background: #0097B2; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; width: 100%; }
.btn-join:hover { background: #007A8F; }
.empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 16px; border: 1px dashed #D1D5DB; }
.empty-state h3 { color: #4B5563; margin-bottom: 15px; }
.btn-explore { background: #1F2937; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; }
</style>