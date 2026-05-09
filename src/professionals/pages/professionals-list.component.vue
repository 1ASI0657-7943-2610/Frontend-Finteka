<template>
  <div class="professionals-view">
    <h1 class="section-title">Encuentra a tu experto</h1>

    <nav class="category-pills">
      <button class="pill" :class="{ active: selectedCategory === 'Todos' }" @click="selectedCategory = 'Todos'">Todos</button>
      <button class="pill" :class="{ active: selectedCategory === 'Finanzas' }" @click="selectedCategory = 'Finanzas'">Finanzas</button>
      <button class="pill" :class="{ active: selectedCategory === 'Legal' }" @click="selectedCategory = 'Legal'">Legal</button>
      <button class="pill" :class="{ active: selectedCategory === 'Tecnologia' }" @click="selectedCategory = 'Tecnologia'">Tecnologia</button>
    </nav>

    <div v-if="isLoading" class="loading">Cargando expertos...</div>

    <div v-else class="experts-grid">
      <div v-for="prof in filteredProfessionals" :key="prof.id" class="expert-card">
        <div class="expert-header">
          <img :src="getGenderPhoto(prof.name || prof.firstName)" class="expert-img" alt="Expert Profile" />
          <div class="expert-meta">
            <h3 class="expert-name-text">{{ prof.name || prof.firstName }}</h3>
            <p class="exp-text">4 años de experiencia</p>
            <div class="rating-status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFC107" stroke="black" stroke-width="2" stroke-linejoin="round"/>
              </svg>
              <span class="rating-val">4.6</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="gap-left">
                <rect width="24" height="24" rx="4" fill="#10B981" stroke="black" stroke-width="2"/>
                <path d="M7 12L10 15L17 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="status-available">Disponible</span>
            </div>
          </div>
        </div>

        <div class="specialty-tags">
          <span class="tag-outline">{{ prof.specialty || prof.occupation || 'Admin' }}</span>
          <span class="tag-outline">{{ prof.district || 'San Isidro' }}</span>
        </div>

        <div class="price-tag">
          <span>S/ {{ prof.price || 75 }}</span>
        </div>

        <button class="btn-reserve" @click="$router.push(`/profesionales/${prof.id}`)">
          Reservar sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import http from '@/shared/services/http-common.js';

import manAvatar from '@/assets/user.avatar.png';
import womanAvatar from '@/assets/user-avatar-female.png';

const professionals = ref([]);
const isLoading = ref(true);
const selectedCategory = ref('Todos');

const femaleNames = ['mia', 'maria', 'ana', 'sofia', 'lucia', 'castillo'];

// ✅ Usa imports en vez de rutas string para evitar errores en producción
const getGenderPhoto = (name) => {
  if (!name) return manAvatar;
  const isFemale = femaleNames.some(f => name.toLowerCase().includes(f));
  return isFemale ? womanAvatar : manAvatar;
};

const fetchProfessionals = async () => {
  try {
    const response = await http.get('/api/professionals'); // ✅
    professionals.value = (response.data || []).map(p => ({
      ...p,
      name: p.name || p.firstName
    }));
  } catch (error) {
    console.error('Error cargando profesionales:', error);
    professionals.value = [
      { id: 1, name: 'Sergio', specialty: 'Finanzas', district: 'San Isidro', price: 75 },
      { id: 2, name: 'Maria', specialty: 'Legal', district: 'Miraflores', price: 90 }
    ];
  } finally {
    isLoading.value = false;
  }
};

const filteredProfessionals = computed(() => {
  if (selectedCategory.value === 'Todos') return professionals.value;
  return professionals.value.filter(p =>
      (p.specialty || p.occupation || '').toLowerCase().includes(selectedCategory.value.toLowerCase())
  );
});

onMounted(() => {
  fetchProfessionals();
});
</script>

<style scoped>
.professionals-view { width: 100%; padding: 20px; font-family: 'Poppins', sans-serif; }
.section-title { font-size: 32px; font-weight: 800; color: #1F2937; margin-bottom: 32px; letter-spacing: -0.5px; }
.category-pills { display: flex; gap: 12px; margin-bottom: 32px; }
.pill { background-color: #FFFFFF; border: 1px solid #E5E7EB; padding: 10px 24px; border-radius: 100px; font-weight: 700; font-size: 15px; color: #1F2937; cursor: pointer; transition: 0.2s; }
.pill.active { background-color: #F3F4F6; border-color: #D1D5DB; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.experts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
.expert-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; transition: 0.3s; }
.expert-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.expert-header { display: flex; gap: 16px; margin-bottom: 16px; }
.expert-img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 1px solid #eee; }
.expert-name-text { font-size: 18px; font-weight: 700; margin: 0; text-transform: capitalize; color: #1F2937; }
.exp-text { font-size: 13px; color: #6B7280; margin: 4px 0; }
.rating-status { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; }
.gap-left { margin-left: 10px; }
.status-available { color: #10B981; }
.specialty-tags { display: flex; gap: 8px; margin: 16px 0; }
.tag-outline { border: 1px solid #0097B2; color: #0097B2; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.price-tag { font-size: 20px; font-weight: 800; color: #0097B2; margin-bottom: 16px; }
.btn-reserve { width: 100%; background-color: #0097B2; color: white; border: none; border-radius: 10px; padding: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-reserve:hover { background-color: #007A8F; }
.loading { text-align: center; padding: 50px; color: #6B7280; }
</style>