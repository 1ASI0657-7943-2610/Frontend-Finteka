<template>
  <div class="reservations-container">
    <header class="page-header">
      <h1 class="page-title">Mis Reservas</h1>
      <p class="page-subtitle">Gestiona tus próximas sesiones con expertos.</p>
    </header>

    <!-- Solo mostramos la cuadrícula si hay reservas en localStorage -->
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
              <div class="info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>{{ res.date }}</span>
              </div>
              <div class="info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{{ res.time }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <div class="status-pill confirmada">
              {{ res.status }}
            </div>
            <button class="btn-join" @click="joinMeeting(res.id)">
              Unirse a sesión
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Si no hay reservas en localStorage, mostramos el mensaje de vacío -->
    <div v-else class="empty-state">
      <div class="empty-icon">📅</div>
      <h3>No tienes reservas pendientes</h3>
      <p>Explora nuestro directorio y agenda tu primera asesoría.</p>
      <button class="btn-explore" @click="$router.push('/profesionales')">Explorar Expertos</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import manAvatar from '@/assets/user.avatar.png';
import womanAvatar from '@/assets/user-avatar-female.png';

const myReservations = ref([]);

// Lista completa de nombres para detectar género
const femaleNames = [
  'mia', 'maria', 'ana', 'sofia', 'lucia', 'castillo', 'carmen', 'natalia', 'valeria', 'elena',
  'laura', 'marta', 'andrea', 'alba', 'paula', 'julia', 'claudia', 'sara', 'irene', 'patricia',
  'silvia', 'rosa', 'teresa', 'beatriz', 'nuria', 'raquel', 'marina', 'angela', 'diana', 'victoria',
  'eva', 'lorena', 'monica', 'isabel', 'gloria', 'rocio', 'alicia', 'cristina', 'alejandra', 'gabriela',
  'daniela', 'valentina', 'camila', 'martina', 'emilia', 'catalina', 'isabella', 'antonella', 'luna', 'zoe',
  'alma', 'olivia', 'emma', 'abigail', 'amanda', 'blanca', 'carla', 'celia', 'clara', 'elisa',
  'esperanza', 'estela', 'ester', 'fatima', 'flora', 'ines', 'judith', 'lidia', 'lourdes', 'margarita',
  'mercedes', 'miriam', 'noelia', 'paloma', 'pilar', 'rebeca', 'rosario', 'susana', 'vanesa', 'veronica',
  'yolanda', 'adriana', 'aitana', 'ariadna', 'cayetana', 'cruz', 'estefania', 'jimena', 'lara', 'leire',
  'lola', 'macarena', 'manuela', 'mar', 'nerea', 'romina', 'tatiana', 'ximena', 'yamila', 'zaira',
  'flor', 'liz', 'milagros', 'angie', 'brenda', 'carolina', 'denisse', 'erika', 'fabiana'
];

const getPhoto = (name = '') => {
  const isFemale = femaleNames.some(f => name.toLowerCase().includes(f));
  return isFemale ? womanAvatar : manAvatar;
};

onMounted(() => {
  // Carga ÚNICAMENTE las reservas del usuario local (simuladas en el flujo de pago)
  const saved = JSON.parse(localStorage.getItem('finteka_reservas') || '[]');

  myReservations.value = saved.map(res => ({
    ...res,
    expertPhoto: getPhoto(res.expertName),
    status: res.status || 'Confirmada'
  }));
});

const joinMeeting = (id) => alert(`Iniciando sesión de videollamada para reserva #${id}...`);
</script>

<style scoped>
/* (Tus estilos originales se mantienen) */
.reservations-container { padding: 40px; max-width: 1000px; margin: 0 auto; font-family: 'Poppins', sans-serif; }
.page-header { margin-bottom: 40px; }
.page-title { font-size: 28px; font-weight: 800; color: #1F2937; margin: 0; }
.page-subtitle { color: #6B7280; margin-top: 8px; }
.reservations-grid { display: flex; flex-direction: column; gap: 20px; }
.reservation-card { background: white; border-radius: 16px; border: 1px solid #E5E7EB; padding: 20px; transition: transform 0.2s; }
.reservation-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.card-content { display: flex; align-items: center; gap: 20px; }
.expert-thumb { width: 70px; height: 70px; border-radius: 50%; overflow: hidden; border: 2px solid #F3F4F6; flex-shrink: 0; background: #f9f9f9; }
.expert-thumb img { width: 100%; height: 100%; object-fit: cover; }
.reservation-details { flex: 1; }
.expert-name { font-size: 18px; font-weight: 700; color: #1F2937; margin: 0 0 4px 0; }
.specialty-tag { font-size: 12px; font-weight: 600; color: #0097B2; background: #E0F7FA; padding: 2px 10px; border-radius: 12px; }
.time-info { display: flex; gap: 20px; margin-top: 12px; }
.info-item { display: flex; align-items: center; gap: 8px; color: #6B7280; font-size: 14px; }
.card-actions { text-align: right; display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
.status-pill { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
.status-pill.confirmada { background: #DCFCE7; color: #166534; }
.btn-join { background: #0097B2; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; }
.btn-join:hover { background: #007A8F; }
.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 60px; margin-bottom: 20px; }
.btn-explore { background: #1F2937; color: white; border: none; padding: 12px 30px; border-radius: 10px; margin-top: 20px; cursor: pointer; font-weight: 600; }
</style>