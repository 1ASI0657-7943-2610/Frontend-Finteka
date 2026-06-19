<template>
  <div v-if="expert" class="detail-container">
    <button class="btn-back" @click="$router.back()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Volver al directorio
    </button>

    <div class="main-layout">
      <aside class="sidebar-info">
        <div class="card profile-main-card">
          <div class="expert-img-container">
            <img :src="expertPhoto" :alt="expert.name" class="expert-img" />
          </div>
          <h1 class="expert-name">{{ expert.name }}</h1>
          <div class="tags-row">
            <span class="tag-category">{{ expert.specialty || expert.occupation || 'Asesor' }}</span>
            <span class="tag-location">{{ expert.district || 'San Isidro' }}</span>
          </div>
          <div class="quick-stats">
            <div class="stat">
              <span class="stat-value">★ 4.6</span>
              <label>Rating</label>
            </div>
            <div class="stat">
              <span class="stat-value">4 años</span>
              <label>Experiencia</label>
            </div>
          </div>
        </div>

        <div class="card booking-card">
          <div class="price-header">
            <span class="amount">S/{{ expert.price || 75 }}</span>
            <span class="period">/ hora</span>
          </div>
          <p class="status-badge"><span class="dot"></span> Disponible ahora</p>
          <button class="btn-reserve" @click="openModal">Reservar sesión</button>
        </div>
      </aside>

      <section class="content-area">
        <div class="card info-card">
          <h2 class="section-title">Sobre el experto</h2>
          <p class="description-text">{{ expert.about }}</p>
        </div>

        <div class="card cv-card">
          <h2 class="section-title">Trayectoria Profesional</h2>
          <div class="cv-section">
            <h3 class="cv-subtitle"><span class="icon">💼</span> Experiencia Laboral</h3>
            <div class="timeline-item" v-for="(exp, index) in expert.experience" :key="'exp-'+index">
              <div class="timeline-dot"></div>
              <h4>{{ exp.role }}</h4>
              <span class="timeline-date">{{ exp.years }}</span>
              <p>{{ exp.desc }}</p>
            </div>
          </div>

          <div class="cv-section">
            <h3 class="cv-subtitle"><span class="icon">🎓</span> Educación</h3>
            <div class="timeline-item" v-for="(edu, index) in expert.education" :key="'edu-'+index">
              <div class="timeline-dot"></div>
              <h4>{{ edu.degree }}</h4>
              <span class="timeline-date">{{ edu.years }}</span>
              <p>{{ edu.desc }}</p>
            </div>
          </div>

          <div class="cv-section">
            <h3 class="cv-subtitle"><span class="icon">⚡</span> Habilidades Destacadas</h3>
            <div class="skills-container">
              <span class="skill-tag" v-for="(skill, index) in expert.skills" :key="'skill-'+index">{{ skill }}</span>
            </div>
          </div>
        </div>

        <div class="card feedback-card">
          <h2 class="section-title">¿Qué te pareció el servicio?</h2>
          <div class="rating-picker">
            <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= rating }" @click="rating = i">★</span>
          </div>
          <div class="comment-box">
            <textarea v-model="comment" placeholder="Escribe aquí tu experiencia..."></textarea>
          </div>
          <button class="btn-send-review" @click="enviarReview">Publicar Comentario</button>

          <div v-if="expertReviews.length > 0" class="reviews-list">
            <hr class="divider" />
            <h3 class="reviews-title">Reseñas recientes</h3>
            <div v-for="(rev, index) in expertReviews" :key="index" class="review-item">
              <div class="review-header">
                <span class="review-stars">{{ '★'.repeat(rev.rating) }}{{ '☆'.repeat(5 - rev.rating) }}</span>
                <span class="review-date">{{ rev.date }}</span>
              </div>
              <p class="review-text">{{ rev.text }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirmar Cita</h2>
          <button class="btn-close-x" @click="closeModal" :disabled="isSimulating">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-intro">Reserva con <strong>{{ expert.name }}</strong></p>
          <div class="price-summary">
            <span>Costo de la sesión:</span>
            <strong>S/ {{ (expert.price || 75).toFixed(2) }}</strong>
          </div>
          <div class="input-group">
            <label>Fecha de la sesión</label>
            <input type="date" v-model="bookingDate" class="modal-input" :disabled="isWaitingForPayment || isSimulating" />
          </div>
          <div class="input-group">
            <label>Hora disponible</label>
            <select v-model="bookingTime" class="modal-input" :disabled="isWaitingForPayment || isSimulating">
              <option value="09:00">09:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">02:00 PM</option>
              <option value="16:00">04:00 PM</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" v-if="!isWaitingForPayment">
          <button class="btn-modal-cancel" @click="closeModal">Cancelar</button>
          <button class="btn-modal-confirm" @click="initiatePayment">Ir a Pagar</button>
        </div>

        <div class="modal-footer payment-simulation-footer" v-else>
          <p class="simulation-text">Se abrió la pestaña de PayPal. Vuelve aquí para simular que el pago fue exitoso.</p>
          <button class="btn-modal-confirm simulate-btn" @click="processSimulatedPayment" :disabled="isSimulating">
            {{ isSimulating ? 'Guardando reserva...' : 'Simular Pago Exitoso' }}
          </button>
          <button class="btn-text-cancel" @click="closeModal" :disabled="isSimulating">Cancelar operación</button>
        </div>

      </div>
    </div>
  </div>

  <div v-else class="loading-screen">
    <p>Cargando perfil del experto...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import http from '@/shared/services/http-common.js';

import manAvatar from '@/assets/user.avatar.png';
import womanAvatar from '@/assets/user-avatar-female.png';

const route = useRoute();
const router = useRouter();
const rating = ref(0);
const comment = ref('');
const expert = ref(null);
const expertReviews = ref([]);
const showModal = ref(false);
const bookingDate = ref('');
const bookingTime = ref('14:00');

const isWaitingForPayment = ref(false);
const isSimulating = ref(false);

const femaleNames = [
  'mia', 'maria', 'ana', 'sofia', 'lucia', 'castillo', 'carmen', 'natalia', 'valeria', 'elena',
  'laura', 'marta', 'andrea', 'alba', 'paula', 'julia', 'claudia', 'sara', 'irene', 'patricia',
  'silvia', 'rosa', 'teresa', 'beatriz', 'nuria', 'raquel', 'marina', 'angela', 'diana', 'victoria',
  'eva', 'lorena', 'monica', 'isabel', 'gloria', 'rocio', 'alicia', 'cristina', 'alejandra', 'gabriela',
  'daniela', 'valentina', 'camila', 'martina', 'emilia', 'catalina', 'isabella', 'antonella', 'luna', 'zoe',
  'alma', 'olivia', 'emma', 'abigail', 'amanda', 'blanca', 'carla', 'celia', 'clara', 'elisa',
  'esperanza', 'estela', 'ester', 'fatima', 'flora', 'ines', 'judith', 'lidia', 'lourdes', 'margarita'
];

const expertPhoto = computed(() => {
  if (!expert.value) return manAvatar;
  const nameLower = (expert.value.name || '').toLowerCase();
  return femaleNames.some(f => nameLower.includes(f)) ? womanAvatar : manAvatar;
});

const generarCVDinamico = (data) => {
  const esp = (data.specialty || data.occupation || 'Administración').toLowerCase();
  return {
    ...data,
    name: data.name || data.firstName,
    about: `¡Hola! Soy ${data.name || data.firstName}, especialista en ${esp}.`,
    experience: [{ role: `Consultor en ${esp}`, years: '2020 - Presente', desc: 'Asesoría profesional.' }],
    education: [{ degree: `Bachiller en ${esp}`, years: '2015 - 2019', desc: 'Universidad de Lima.' }],
    skills: ['Estrategia', 'Análisis', 'Liderazgo']
  };
};

const loadExpertAndReviews = async () => {
  const id = route.params.id;
  try {
    const response = await http.get(`/api/professionals/${id}`);
    expert.value = generarCVDinamico(response.data);
  } catch (error) {
    expert.value = generarCVDinamico({ id, name: 'Asesor FinTeka', specialty: 'Finanzas', price: 75 });
  }
  const allReviews = JSON.parse(localStorage.getItem('finteka_reviews') || '[]');
  expertReviews.value = allReviews.filter(r => r.expertId == id);
};

const openModal = () => {
  showModal.value = true;
  isWaitingForPayment.value = false;
};

const closeModal = () => {
  if (isSimulating.value) return;
  showModal.value = false;
  isWaitingForPayment.value = false;
};

const initiatePayment = () => {
  if (!bookingDate.value) return alert('Por favor, selecciona una fecha para tu sesión.');
  window.open('https://www.paypal.com', '_blank');
  isWaitingForPayment.value = true;
};

const processSimulatedPayment = async () => {
  isSimulating.value = true;

  // 1. Intentamos guardar en la base de datos (si falla, lo ignoramos para que la app no se rompa)
  try {
    const savedProfile = JSON.parse(localStorage.getItem('finteka_user_profile') || '{}');
    const profileId = savedProfile.id || 1;
    await http.post('/api/reservations', {
      startTime: `${bookingDate.value}T${bookingTime.value}:00`,
      professionalId: expert.value.id,
      profileId: profileId,
      status: 'CONFIRMED'
    });
  } catch (e) {
    console.error('Error guardando en BD, pero simularemos el éxito localmente.');
  }

  // 2. Guardamos la reserva localmente para que aparezca en "Mis Reservas"
  const nuevaReserva = {
    id: Date.now(),
    expertName: expert.value.name,
    specialty: expert.value.specialty || expert.value.occupation || 'Especialista',
    date: bookingDate.value,
    time: bookingTime.value,
    status: 'Confirmada',
    paid: expert.value.price || 75
  };
  const reservas = JSON.parse(localStorage.getItem('finteka_reservas') || '[]');
  reservas.unshift(nuevaReserva);
  localStorage.setItem('finteka_reservas', JSON.stringify(reservas));

  // 3. GENERAMOS LA NOTIFICACIÓN PARA LA VENTANITA
  const notifs = JSON.parse(localStorage.getItem('finteka_notificaciones') || '[]');
  notifs.unshift({
    id: Date.now(),
    type: 'Cita',
    text: `¡Reserva confirmada! Tienes una asesoría en ${nuevaReserva.specialty} con ${nuevaReserva.expertName}.`,
    date: 'Justo ahora',
    read: false
  });
  localStorage.setItem('finteka_notificaciones', JSON.stringify(notifs));

  alert(`Pago simulado exitosamente. Tu cita con ${expert.value.name} está confirmada.`);
  isSimulating.value = false;
  closeModal();
  router.push('/reservas');
};

const enviarReview = async () => {
  if (rating.value === 0 || !comment.value) return alert('Completa la reseña.');
  try {
    await http.post('/api/ratings', { professionalId: expert.value.id, score: rating.value, comment: comment.value });
  } catch (error) {}

  const nuevaReview = {
    expertId: expert.value.id, rating: rating.value, text: comment.value, date: new Date().toLocaleDateString()
  };
  const allReviews = JSON.parse(localStorage.getItem('finteka_reviews') || '[]');
  allReviews.unshift(nuevaReview);
  localStorage.setItem('finteka_reviews', JSON.stringify(allReviews));

  rating.value = 0;
  comment.value = '';
  loadExpertAndReviews();
  alert('¡Reseña publicada!');
};

onMounted(loadExpertAndReviews);
watch(() => route.params.id, loadExpertAndReviews);
</script>

<style scoped>
.detail-container { padding: 40px; max-width: 1200px; margin: 0 auto; font-family: 'Poppins', sans-serif; }
.loading-screen { display: flex; align-items: center; justify-content: center; height: 50vh; color: #6B7280; font-family: 'Poppins', sans-serif; }
.btn-back { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #4B5563; font-weight: 600; cursor: pointer; margin-bottom: 30px; }
.main-layout { display: grid; grid-template-columns: 320px 1fr; gap: 30px; align-items: start; }
.card { background: white; border-radius: 16px; border: 1px solid #E5E7EB; padding: 25px; margin-bottom: 25px; }
.profile-main-card { text-align: center; }
.expert-img-container { width: 100px; height: 100px; margin: 0 auto 15px; border-radius: 50%; border: 2px solid #E5E7EB; overflow: hidden; }
.expert-img { width: 100%; height: 100%; object-fit: cover; }
.expert-name { font-size: 20px; font-weight: 700; color: #1F2937; margin: 0; text-transform: capitalize; }
.tags-row { display: flex; gap: 8px; justify-content: center; margin: 15px 0; }
.tag-category { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #E0F2FE; color: #0369A1; }
.tag-location { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #F3F4F6; color: #4B5563; }
.quick-stats { display: flex; justify-content: space-around; padding-top: 15px; border-top: 1px solid #F3F4F6; }
.stat-value { display: block; font-weight: 700; color: #1F2937; }
.stat label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; }
.booking-card { background: #0097B2; color: white; border: none; }
.amount { font-size: 28px; font-weight: 700; }
.period { font-size: 14px; opacity: 0.9; }
.status-badge { font-size: 13px; margin: 10px 0 20px; display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; background: #4ADE80; border-radius: 50%; }
.btn-reserve { width: 100%; padding: 12px; border-radius: 10px; border: none; background: white; color: #0097B2; font-weight: 700; cursor: pointer; }
.section-title { font-size: 18px; font-weight: 700; color: #1F2937; margin-bottom: 15px; }
.description-text { color: #4B5563; line-height: 1.6; font-size: 14px; }
.rating-picker { font-size: 32px; color: #E5E7EB; margin-bottom: 20px; }
.star { cursor: pointer; margin-right: 5px; }
.star.filled { color: #FFB800; }
.comment-box textarea { width: 100%; height: 100px; border: 1px solid #E5E7EB; border-radius: 12px; padding: 15px; font-family: inherit; resize: none; outline: none; background: #F9FAFB; }
.btn-send-review { padding: 10px 20px; background: #1F2937; color: white; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; margin-top: 10px; }
.divider { border: 0; border-top: 1px solid #F3F4F6; margin: 20px 0; }
.reviews-title { font-size: 16px; font-weight: 700; margin-bottom: 20px; }
.review-item { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #F9FAFB; }
.review-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
.review-stars { color: #FFB800; font-size: 14px; }
.review-date { font-size: 12px; color: #9CA3AF; }
.review-text { font-size: 14px; color: #4B5563; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 30px; border-radius: 20px; width: 400px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-close-x { background: none; border: none; font-size: 24px; cursor: pointer; }
.price-summary { background: #F0FBFC; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.price-summary strong { color: #0097B2; font-size: 18px; }
.input-group { margin-bottom: 20px; }
.input-group label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.modal-input { width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 10px; outline: none; }
.modal-input:disabled { background: #F3F4F6; color: #9CA3AF; cursor: not-allowed; }
.modal-footer { display: flex; gap: 12px; }
.btn-modal-cancel { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #E5E7EB; cursor: pointer; }
.btn-modal-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-modal-confirm { flex: 1; padding: 12px; border-radius: 10px; background: #0097B2; color: white; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; }
.btn-modal-confirm:disabled { background: #6B7280; cursor: wait; }
.payment-simulation-footer { display: flex; flex-direction: column; text-align: center; gap: 12px; }
.simulation-text { font-size: 13px; color: #4B5563; margin: 0; font-weight: 500; }
.simulate-btn { width: 100%; padding: 12px; border-radius: 10px; background: #10B981; color: white; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; }
.simulate-btn:hover { background: #059669; }
.simulate-btn:disabled { background: #6B7280; cursor: wait; }
.btn-text-cancel { background: none; border: none; color: #EF4444; font-size: 13px; cursor: pointer; text-decoration: underline; margin-top: 5px; }
.cv-section { margin-bottom: 25px; }
.cv-subtitle { font-size: 16px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
.timeline-item { position: relative; padding-left: 20px; margin-bottom: 20px; border-left: 2px solid #E5E7EB; }
.timeline-dot { position: absolute; left: -6px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #0097B2; border: 2px solid white; }
.timeline-item h4 { margin: 0; font-size: 15px; }
.timeline-date { font-size: 12px; color: #0097B2; font-weight: 600; }
.skills-container { display: flex; flex-wrap: wrap; gap: 10px; }
.skill-tag { padding: 6px 14px; background: #F3F4F6; border-radius: 20px; font-size: 13px; }
</style>