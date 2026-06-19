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
              <span class="stat-value">{{ expert.experienceYears }} años</span>
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
          <div class="info-header">
            <h2 class="section-title">Sobre el experto</h2>
            <button class="btn-download-cv" @click="downloadCV">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Ver CV PDF
            </button>
          </div>
          <p class="description-text">{{ expert.about }}</p>

          <div class="extra-details-grid">
            <div class="detail-item">
              <strong>Edad</strong>
              <span>{{ expert.age }} años</span>
            </div>
            <div class="detail-item">
              <strong>Especialidad</strong>
              <span style="text-transform: capitalize;">{{ expert.specialty || expert.occupation || 'Asesor' }}</span>
            </div>
            <div class="detail-item">
              <strong>Experiencia</strong>
              <span>{{ expert.experienceYears }} años comprobados</span>
            </div>
            <div class="detail-item">
              <strong>Idiomas</strong>
              <span>{{ expert.languages.join(', ') }}</span>
            </div>
          </div>
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
            {{ isSimulating ? 'Guardando reserva...' : 'Pagar' }}
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
  'laura', 'marta', 'andrea', 'alba', 'paula', 'julia', 'claudia', 'sara', 'irene', 'patricia'
];

const expertPhoto = computed(() => {
  if (!expert.value) return manAvatar;
  const nameLower = (expert.value.name || '').toLowerCase();
  return femaleNames.some(f => nameLower.includes(f)) ? womanAvatar : manAvatar;
});

const generarCVDinamico = (data) => {
  const name = data.name || data.firstName || 'Especialista';
  const esp = (data.specialty || data.occupation || 'Asesoría').toLowerCase();

  const seed = parseInt(data.id) || name.length;

  const calcAge = 28 + (seed % 15);
  const calcExp = Math.max(3, seed % 12);

  const allLanguages = [['Español (Nativo)', 'Inglés (Fluido)'], ['Español (Nativo)', 'Portugués (Intermedio)'], ['Español', 'Inglés', 'Francés'], ['Español (Nativo)', 'Alemán (Básico)']];
  const selectedLangs = allLanguages[seed % allLanguages.length];

  return {
    ...data,
    name: name,
    age: data.age || calcAge,
    experienceYears: calcExp,
    languages: data.languages || selectedLangs,
    about: data.about || `¡Hola! Soy ${name}, especialista en el área de ${esp}. Cuento con ${calcExp} años de experiencia dedicados a brindar consultoría de alto nivel, optimizando procesos y estrategias para garantizar el éxito de mis clientes.`,
    experience: data.experience || [
      { role: `Especialista Senior en ${esp}`, years: `20${24 - calcExp} - Presente`, desc: 'Liderazgo de proyectos y consultoría empresarial.' },
      { role: `Analista de ${esp}`, years: `20${24 - calcExp - 3} - 20${24 - calcExp}`, desc: 'Desarrollo de análisis estratégico y apoyo corporativo.' }
    ],
    education: data.education || [{ degree: `Licenciatura relacionada a ${esp}`, years: `20${24 - calcExp - 7} - 20${24 - calcExp - 3}`, desc: 'Estudios de grado superior universitario.' }],
    skills: data.skills || ['Estrategia', 'Resolución de problemas', 'Liderazgo de equipos', 'Análisis']
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

const downloadCV = () => {
  const e = expert.value;

  const cvHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>CV_${e.name.replace(/\s+/g, '_')}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; color: #1F2937; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #F4F7FE; }

        .cv-wrapper { max-width: 850px; margin: 0 auto; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); min-height: 100vh; }

        .header { background-color: #1F2937; color: white; padding: 40px; text-align: center; border-bottom: 5px solid #0097B2; }
        .header h1 { margin: 0; font-size: 36px; color: #FFFFFF; letter-spacing: 1px; }
        .header p { margin: 10px 0 0; font-size: 18px; color: #0097B2; font-weight: 600; text-transform: uppercase; }

        .content { display: flex; }

        .sidebar { width: 35%; background-color: #F9FAFB; padding: 40px 30px; border-right: 1px solid #E5E7EB; }
        .main-content { width: 65%; padding: 40px 30px; }

        h2 { color: #1F2937; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 20px; }
        .sidebar h2 { margin-top: 30px; font-size: 16px; }
        .sidebar h2:first-child { margin-top: 0; }

        .info-block { margin-bottom: 20px; }
        .info-block strong { display: block; font-size: 11px; color: #9CA3AF; text-transform: uppercase; margin-bottom: 4px; }
        .info-block span { font-size: 14px; font-weight: 600; color: #4B5563; }

        .tag-container { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { background: #E0F2FE; color: #0369A1; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }

        .about-text { font-size: 13px; line-height: 1.8; color: #4B5563; margin-bottom: 35px; text-align: justify; }

        .timeline-item { margin-bottom: 25px; position: relative; padding-left: 15px; border-left: 2px solid #0097B2; }
        .timeline-item h4 { margin: 0 0 5px; font-size: 16px; color: #1F2937; }
        .timeline-date { font-size: 12px; color: #0097B2; font-weight: 700; margin-bottom: 8px; }
        .timeline-item p { font-size: 13px; color: #4B5563; line-height: 1.6; margin: 0; }

        .footer { text-align: center; padding: 20px; font-size: 11px; color: #9CA3AF; background: #1F2937; color: white; }

        @media print {
          body { background: white; padding: 0; }
          .cv-wrapper { box-shadow: none; max-width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="cv-wrapper">
        <div class="header">
          <h1>${e.name}</h1>
          <p>${e.specialty || e.occupation || 'Consultoría Especializada'}</p>
        </div>

        <div class="content">
          <div class="sidebar">
            <h2>Datos Personales</h2>
            <div class="info-block"><strong>Edad</strong><span>${e.age} años</span></div>
            <div class="info-block"><strong>Ubicación</strong><span>${e.district || 'San Isidro, Lima'}</span></div>
            <div class="info-block"><strong>Experiencia Total</strong><span>${e.experienceYears} años comprobados</span></div>

            <h2>Idiomas</h2>
            ${e.languages.map(l => `<div class="info-block"><span>✓ ${l}</span></div>`).join('')}

            <h2>Habilidades Top</h2>
            <div class="tag-container">
              ${e.skills.map(s => `<span class="tag">${s}</span>`).join('')}
            </div>
          </div>

          <div class="main-content">
            <h2>Resumen Profesional</h2>
            <p class="about-text">${e.about}</p>

            <h2>Experiencia Laboral</h2>
            ${e.experience.map(exp => `
              <div class="timeline-item">
                <h4>${exp.role}</h4>
                <div class="timeline-date">${exp.years}</div>
                <p>${exp.desc}</p>
              </div>
            `).join('')}

            <h2 style="margin-top: 35px;">Formación Académica</h2>
            ${e.education.map(ed => `
              <div class="timeline-item">
                <h4>${ed.degree}</h4>
                <div class="timeline-date">${ed.years}</div>
                <p>${ed.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="footer">
          Perfil profesional verificado y exportado desde la plataforma FinTeka.
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(cvHTML);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1000);
  } else {
    alert("Tu navegador bloqueó la ventana emergente. Por favor, permite los pop-ups para FinTeka e intenta nuevamente.");
  }
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
  try {
    const savedProfile = JSON.parse(localStorage.getItem('finteka_user_profile') || '{}');
    const profileId = savedProfile.id || 1;
    await http.post('/api/reservations', {
      startTime: `${bookingDate.value}T${bookingTime.value}:00`,
      professionalId: expert.value.id,
      profileId: profileId,
      status: 'CONFIRMED'
    });
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
    closeModal();
    router.push('/reservas');
  } catch (e) {
    alert('Hubo un error de conexión al guardar la cita en la base de datos.');
  } finally {
    isSimulating.value = false;
  }
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

.info-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.btn-download-cv { background: #F3F4F6; color: #4B5563; border: 1px solid #E5E7EB; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
.btn-download-cv:hover { background: #E5E7EB; color: #1F2937; }
.extra-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #F3F4F6; }
.detail-item { font-size: 13px; color: #4B5563; display: flex; flex-direction: column; gap: 4px; }
.detail-item strong { color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-item span { color: #1F2937; font-weight: 600; }

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
.section-title { font-size: 18px; font-weight: 700; color: #1F2937; margin: 0; }
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
.btn-modal-confirm { flex: 1; padding: 12px; border-radius: 10px; background: #0097B2; color: white; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; }
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