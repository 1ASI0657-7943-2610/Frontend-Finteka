<template>
  <div class="profile-view">
    <div class="cover-photo"></div>

    <div class="profile-header">
      <div class="avatar-container">
        <div class="avatar-wrapper" @click="triggerFileInput">
          <img :src="profileData.avatar || '/user-avatar.png'" alt="Usuario" class="profile-avatar" />
          <div class="avatar-overlay">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <span>Cambiar</span>
          </div>
        </div>
        <input type="file" ref="fileInput" accept="image/*" style="display: none;" @change="onFileSelected" />
      </div>

      <div class="profile-info-row">
        <div class="user-titles">
          <h2>{{ profileData.name }}</h2>
          <p class="join-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Fecha de registro: 25 de abril de 2026
          </p>
        </div>

        <button class="edit-btn" :class="{'save-mode': isEditing}" @click="toggleEdit">
          <div class="edit-btn-content">
            <svg v-if="isEditing" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <span class="edit-text">{{ isEditing ? 'Guardar perfil' : 'Editar perfil' }}</span>
          </div>
        </button>
      </div>
    </div>

    <div class="details-card">
      <h3 class="card-title">Detalles de perfil</h3>
      <div class="details-grid">
        <div class="detail-item">
          <div class="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
          <div class="detail-text">
            <label>Nombre completo</label>
            <p v-if="!isEditing">{{ profileData.name }}</p>
            <input v-else v-model="profileData.name" type="text" class="edit-input" />
          </div>
        </div>

        <div class="detail-item">
          <div class="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
          <div class="detail-text">
            <label>Correo</label>
            <p v-if="!isEditing">{{ profileData.email }}</p>
            <input v-else v-model="profileData.email" type="email" class="edit-input" />
          </div>
        </div>

        <div class="detail-item">
          <div class="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
          <div class="detail-text" style="position: relative;">
            <label>País / Dirección</label>
            <p v-if="!isEditing">{{ profileData.address }}</p>
            <div v-else>
              <input
                  v-model="profileData.address"
                  type="text"
                  class="edit-input"
                  placeholder="Escribe tu país..."
                  @input="showCountries = true"
              />
              <ul v-if="showCountries && filteredCountries.length" class="countries-dropdown">
                <li v-for="country in filteredCountries" :key="country" @click="selectCountry(country)">
                  {{ country }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="detail-item">
          <div class="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div>
          <div class="detail-text">
            <label>Teléfono</label>
            <p v-if="!isEditing">{{ profileData.phone }}</p>
            <input v-else v-model="profileData.phone" type="text" class="edit-input" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';

const isEditing = ref(false);
const fileInput = ref(null);
const showCountries = ref(false);

const profileData = reactive({
  name: 'Sergiossss',
  email: 'sergio@gmail.com',
  address: 'Lima, Peru',
  phone: '987654321',
  avatar: null
});

// Lista de países para el autocompletado
const countries = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador',
  'El Salvador', 'España', 'Estados Unidos', 'Guatemala', 'Honduras', 'México', 'Nicaragua',
  'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela'
];

// Filtro dinámico de países
const filteredCountries = computed(() => {
  if (!profileData.address) return countries;
  return countries.filter(c =>
      c.toLowerCase().includes(profileData.address.toLowerCase())
  );
});

const selectCountry = (country) => {
  profileData.address = country;
  showCountries.value = false;
};

onMounted(() => {
  const saved = localStorage.getItem('finteka_user_profile');
  if (saved) Object.assign(profileData, JSON.parse(saved));
});

const sendNotification = (message) => {
  const actualesNotif = JSON.parse(localStorage.getItem('finteka_notificaciones') || '[]');
  actualesNotif.unshift({
    id: Date.now(),
    type: 'Sistema',
    text: message,
    date: new Date().toLocaleDateString(),
    read: false
  });
  localStorage.setItem('finteka_notificaciones', JSON.stringify(actualesNotif));
};

const toggleEdit = () => {
  if (isEditing.value) {
    localStorage.setItem('finteka_user_profile', JSON.stringify(profileData));
    window.dispatchEvent(new Event('profile-updated'));
    sendNotification('¡Perfil actualizado! Tus datos personales se han guardado correctamente.');
    showCountries.value = false;
  }
  isEditing.value = !isEditing.value;
};

const triggerFileInput = () => fileInput.value.click();

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileData.avatar = e.target.result;
      localStorage.setItem('finteka_user_profile', JSON.stringify(profileData));
      window.dispatchEvent(new Event('profile-updated'));
      sendNotification('¡Foto actualizada! Tu avatar se ha cambiado con éxito.');
    };
    reader.readAsDataURL(file);
  }
};
</script>

<style scoped>
/* TU CSS ORIGINAL SE MANTIENE IGUAL */
.profile-view { width: 100%; font-family: 'Poppins', sans-serif; }
.cover-photo { height: 160px; background-color: #007B8F; border-radius: 16px; margin: 0 20px; }
.profile-header { padding: 0 60px; margin-top: -60px; margin-bottom: 30px; }
.avatar-container { display: inline-block; background: white; border-radius: 50%; padding: 6px; }
.avatar-wrapper { position: relative; width: 120px; height: 120px; border-radius: 50%; overflow: hidden; cursor: pointer; border: 2px solid white; }
.profile-avatar { width: 100%; height: 100%; object-fit: cover; }
.avatar-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; opacity: 0; transition: 0.3s; }
.avatar-wrapper:hover .avatar-overlay { opacity: 1; }
.avatar-overlay svg { width: 24px; margin-bottom: 4px; }
.profile-info-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px; }
.user-titles h2 { font-size: 28px; font-weight: 800; color: #1F2937; margin: 0; }
.join-date { display: flex; align-items: center; gap: 8px; color: #9CA3AF; font-size: 14px; margin-top: 5px; font-weight: 500; }
.join-date svg { width: 16px; }
.edit-btn { background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 10px 20px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.edit-btn-content { display: flex; align-items: center; gap: 10px; }
.icon { width: 20px; height: 20px; color: #4B5563; }
.edit-text { font-size: 14px; font-weight: 700; color: #4B5563; font-family: 'Poppins', sans-serif; }
.edit-btn:hover { background: #F9FAFB; transform: translateY(-1px); }
.save-mode { border-color: #0097B2; background: #F0FBFC; }
.save-mode .icon, .save-mode .edit-text { color: #0097B2; }
.details-card { background: white; border-radius: 24px; padding: 40px; margin: 0 40px; border: 1px solid #E5E7EB; }
.card-title { font-size: 18px; font-weight: 800; margin-bottom: 30px; color: #1F2937; }
.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.detail-item { display: flex; align-items: center; gap: 20px; }
.icon-box svg { width: 22px; height: 22px; color: #9CA3AF; }
.detail-text label { font-size: 12px; color: #9CA3AF; display: block; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-text p { font-weight: 700; color: #1F2937; margin-top: 4px; font-size: 15px; }
.edit-input { width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 8px; font-family: inherit; margin-top: 4px; }

/* NUEVOS ESTILOS PARA EL DROPDOWN DE PAÍSES */
.countries-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 10;
  max-height: 150px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
}
.countries-dropdown li {
  padding: 10px 15px;
  font-size: 14px;
  color: #4B5563;
  cursor: pointer;
  transition: background 0.2s;
}
.countries-dropdown li:hover {
  background: #F0FBFC;
  color: #0097B2;
}
</style>