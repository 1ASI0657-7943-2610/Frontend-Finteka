<template>
  <div class="dashboard-wrapper">
    <div class="banner">
      <div class="banner-content">
        <h2>¡Bienvenido de nuevo, {{ userName }}!</h2>
        <p>Tienes {{ filteredProfessionals.length }} expertos disponibles para asesorarte.</p>
      </div>
      <div class="banner-illustration">
        <img src="../../assets/hero-illustration.png" alt="FinTeka Hero" class="hero-img" />
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Profesionales destacados</h3>

      <div class="filter-pills-container">
        <button class="filter-pill" :class="{ active: searchQuery === '' }" @click="filtrarPorEspecialidad('')">Todos</button>
        <button class="filter-pill" :class="{ active: searchQuery === 'finanzas' }" @click="filtrarPorEspecialidad('finanzas')">Finanzas</button>
        <button class="filter-pill" :class="{ active: searchQuery === 'legal' }" @click="filtrarPorEspecialidad('legal')">Legal</button>
        <button class="filter-pill" :class="{ active: searchQuery === 'tecnologia' }" @click="filtrarPorEspecialidad('tecnologia')">Tecnología</button>
        <button class="filter-pill fav-pill" :class="{ active: showOnlyFavorites }" @click="toggleFilterFavorites">
          Mis Favoritos
        </button>
      </div>

      <div v-if="isLoading" class="loader-text">Conectando con expertos...</div>

      <div v-else-if="filteredProfessionals.length === 0" class="loader-text">
        No se encontraron expertos en esta selección.
      </div>

      <div v-else class="cards-grid">
        <div class="session-card" v-for="prof in filteredProfessionals" :key="prof.id">
          <button class="btn-favorite" @click.stop="toggleFavorite(prof.id)">
            <svg :class="{ 'is-fav': isFavorite(prof.id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <div class="card-header">
            <img :src="isValidImage(prof.profilePhoto) ? prof.profilePhoto : getDefaultAvatar(prof.name || prof.firstName)" alt="Avatar" class="avatar" />
            <div class="doctor-info">
              <h4>{{ prof.name || prof.firstName }}</h4>
              <span>{{ prof.specialty || prof.occupation || 'Especialista' }}</span>
            </div>
          </div>

          <div class="card-time">
            <svg class="icon-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Ubicación: {{ prof.district || 'San Isidro' }}</span>
          </div>

          <button class="btn-outline" @click="$router.push(`/profesionales/${prof.id}`)">Ver detalles</button>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Explorar por especialidad</h3>
      <div class="specialty-grid">
        <div class="specialty-card" @click="filtrarPorEspecialidad('finanzas')">
          <img src="../../assets/icon-finanzas.png" alt="Finanzas" class="specialty-icon-img" />
          <h4>Finanzas</h4>
        </div>
        <div class="specialty-card" @click="filtrarPorEspecialidad('anuncio')">
          <img src="../../assets/finanzas.png" alt="Anuncio" class="specialty-icon-img" />
          <h4>Anuncio</h4>
        </div>
        <div class="specialty-card" @click="filtrarPorEspecialidad('tecnologia')">
          <img src="../../assets/icon-tecnologia.png" alt="Tecnología" class="specialty-icon-img" />
          <h4>Tecnologia</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import http from '@/shared/services/http-common.js';

import defaultMale from '@/assets/user.avatar.png';
import defaultFemale from '@/assets/user-avatar-female.png';

const userName = ref('Usuario'); // ✅ valor por defecto genérico
const professionals = ref([]);
const favorites = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const showOnlyFavorites = ref(false);

const filteredProfessionals = computed(() => {
  let list = professionals.value;
  if (showOnlyFavorites.value) {
    list = list.filter(prof => favorites.value.includes(prof.id));
  }
  if (!searchQuery.value) return list;
  const query = searchQuery.value.toLowerCase().trim();
  return list.filter(prof => {
    const name = (prof.name || prof.firstName || '').toLowerCase();
    const specialty = (prof.specialty || prof.occupation || '').toLowerCase();
    return name.includes(query) || specialty.includes(query);
  });
});

const toggleFavorite = (id) => {
  if (favorites.value.includes(id)) {
    favorites.value = favorites.value.filter(favId => favId !== id);
  } else {
    favorites.value.push(id);
  }
  localStorage.setItem('finteka_favorites', JSON.stringify(favorites.value));
};

const isFavorite = (id) => favorites.value.includes(id);

const toggleFilterFavorites = () => {
  showOnlyFavorites.value = !showOnlyFavorites.value;
  if (showOnlyFavorites.value) searchQuery.value = '';
};

const isValidImage = (url) => url && url !== 'string' && url.startsWith('http');

const getDefaultAvatar = (name) => {
  if (!name) return defaultMale;
  const femaleNames = ['mia', 'maria', 'ana', 'sofia', 'lucia', 'castillo'];
  return femaleNames.some(f => name.toLowerCase().includes(f)) ? defaultFemale : defaultMale;
};

const fetchProfessionals = async () => {
  try {
    const response = await http.get('/api/professionals');
    professionals.value = (response.data || []).map(p => ({
      ...p,
      name: p.name || p.firstName
    })).reverse();
  } catch (error) {
    console.error("Error API:", error);
    professionals.value = [
      { id: 1, name: 'Sergio', specialty: 'Finanzas', district: 'San Isidro', price: 75 },
      { id: 2, name: 'Maria', specialty: 'Legal', district: 'Miraflores', price: 90 }
    ];
  } finally {
    isLoading.value = false;
  }
};

const filtrarPorEspecialidad = (esp) => {
  showOnlyFavorites.value = false;
  searchQuery.value = (searchQuery.value === esp) ? '' : esp;
};

onMounted(() => {
  // ✅ Lee el nombre del usuario guardado en el login
  const savedProfile = localStorage.getItem('finteka_user_profile');
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    userName.value = profile.name || 'Usuario';
  } else {
    // fallback: intenta con la clave simple
    const savedName = localStorage.getItem('userName');
    if (savedName) userName.value = savedName;
  }

  const savedFavs = localStorage.getItem('finteka_favorites');
  if (savedFavs) favorites.value = JSON.parse(savedFavs);

  fetchProfessionals();
});
</script>

<style scoped>
.dashboard-wrapper { display: flex; flex-direction: column; gap: 2.5rem; font-family: 'Poppins', sans-serif; }
.banner { background: linear-gradient(90deg, #095a63 0%, #0097B2 100%); border-radius: 16px; padding: 2.5rem 3rem; display: flex; justify-content: space-between; align-items: center; color: #FFFFFF; }
.banner-content h2 { font-size: 1.8rem; font-weight: 600; margin: 0 0 0.5rem 0; }
.hero-img { height: 140px; object-fit: contain; }
.section-title { font-size: 1.25rem; font-weight: 600; color: #1F2937; margin-bottom: 1.5rem; }
.loader-text { color: #6B7280; font-style: italic; margin-top: 1rem; text-align: center; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.session-card { background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; position: relative; }
.btn-favorite { position: absolute; top: 15px; right: 15px; background: white; border: 1px solid #E5E7EB; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; z-index: 5; }
.btn-favorite svg { width: 18px; height: 18px; color: #9CA3AF; transition: 0.2s; }
.btn-favorite svg.is-fav { fill: #EF4444; color: #EF4444; }
.card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: #f0f0f0; }
.doctor-info h4 { font-size: 1rem; margin: 0; color: #1F2937; text-transform: capitalize; }
.doctor-info span { font-size: 0.85rem; color: #6B7280; }
.card-time { display: flex; align-items: center; gap: 0.6rem; color: #6B7280; font-size: 0.85rem; margin-bottom: 1.5rem; }
.icon-calendar { width: 18px; height: 18px; flex-shrink: 0; }
.btn-outline { width: 100%; padding: 0.7rem; background: transparent; border: 1px solid #0097B2; color: #0097B2; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s; }
.btn-outline:hover { background: #0097B2; color: white; }
.filter-pills-container { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-pill { padding: 8px 20px; border-radius: 24px; border: 1px solid #E5E7EB; background: #FFF; color: #4B5563; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.2s; }
.filter-pill.active { background: #0097B2; color: white; border-color: #0097B2; }
.fav-pill.active { background: #EF4444; border-color: #EF4444; }
.specialty-grid { display: flex; gap: 1.5rem; overflow-x: auto; padding-bottom: 10px; }
.specialty-card { background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 1.5rem; flex: 1; min-width: 150px; display: flex; flex-direction: column; align-items: center; gap: 1rem; cursor: pointer; transition: 0.2s; }
.specialty-icon-img { width: 44px; height: 44px; object-fit: contain; }
.specialty-card h4 { font-size: 1rem; margin: 0; font-weight: 600; }
</style>