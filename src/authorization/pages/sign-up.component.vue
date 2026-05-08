<template>
  <div class="login-page">
    <div class="form-container">
      <div class="form-content">
        <h1 class="logo">Fin<span>Teka</span></h1>

        <div class="header-text">
          <h2>Crea tu cuenta</h2>
          <p>Por favor ingresa tus datos para empezar</p>
        </div>

        <div class="auth-tabs">
          <button class="tab-btn" @click="$router.push('/login')">Iniciar sesión</button>
          <button class="tab-btn active">Registrarse</button>
        </div>

        <form @submit.prevent="handleRegister" class="login-form">
          <div class="input-group">
            <div class="icon-section">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9 19.5 16.9 18.8 16.1C18 15.4 17 15 16 15H8C6.9 15 5.9 15.4 5.1 16.1C4.4 16.9 4 17.9 4 19V21" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="divider"></div>
            <div class="input-field">
              <label>Nombre de usuario</label>
              <input v-model="name" type="text" placeholder="Tu nombre" required />
            </div>
          </div>

          <div class="input-group">
            <div class="icon-section">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 6L12 13L2 6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="divider"></div>
            <div class="input-field">
              <label>Email</label>
              <input v-model="email" type="email" placeholder="ejemplo@correo.com" required />
            </div>
          </div>

          <div class="input-group">
            <div class="icon-section">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" fill="black" stroke="black" stroke-width="2"/>
                <line x1="3" y1="21" x2="21" y2="3" stroke="black" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="divider"></div>
            <div class="input-field">
              <label>Password</label>
              <input v-model="password" type="password" placeholder="****************" required />
            </div>
          </div>

          <p v-if="feedbackMessage" :style="{ color: isError ? '#DC2626' : '#059669', fontSize: '13px', margin: '-5px 0 10px 0', fontWeight: '500' }">
            {{ feedbackMessage }}
          </p>

          <button type="submit" class="btn-submit" :disabled="isLoading">
            {{ isLoading ? 'Creando cuenta...' : 'Registrarse' }}
          </button>
        </form>
      </div>
    </div>

    <div class="image-container">
      <div class="illustration-wrapper">
        <img src="/login.png" alt="FinTeka Illustration" class="side-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import http from '../../shared/services/http-common.js';

const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const feedbackMessage = ref('');
const isError = ref(false);
const isLoading = ref(false);

const handleRegister = async () => {
  isLoading.value = true;
  isError.value = false;
  feedbackMessage.value = '';

  try {
    // Datos obligatorios según tu Swagger
    const newUserData = {
      email: email.value,
      name: name.value,
      password: password.value,
      profilePhoto: "string",
      age: 20,
      specialty: "Admin",
      workExperience: "None",
      district: "San Isidro",
      languages: "Español",
      publishedServices: 0,
      averageRating: 0,
      totalReviewsReceived: 0
    };

    // Usamos la ruta absoluta que configuramos en http-common
    const response = await http.post('/api/profiles', newUserData);

    if (response.status === 201 || response.status === 200) {
      feedbackMessage.value = '¡Cuenta creada con éxito! Redirigiendo...';
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  } catch (error) {
    console.error("Error en registro:", error);
    isError.value = true;
    // Si sale error aquí, es casi seguro que es el CORS del Backend
    feedbackMessage.value = 'Error de conexión o permisos (CORS). Revisa tu Backend.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Tu CSS intacto */
.login-page {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: 'Poppins', sans-serif;
  background-color: #ffffff;
  overflow: hidden;
}
.form-container { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
.form-content { width: 100%; max-width: 400px; text-align: center; }
.logo { font-size: 48px; font-weight: 700; color: #1F2937; margin-bottom: 40px; }
.logo span { color: #0097B2; }
.header-text h2 { font-size: 26px; font-weight: 700; color: #000; margin: 0; }
.header-text p { color: #9CA3AF; font-size: 14px; margin: 8px 0 32px 0; }
.auth-tabs { display: flex; background: #F3F4F6; padding: 4px; border-radius: 12px; margin-bottom: 32px; }
.tab-btn { flex: 1; padding: 12px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; background: transparent; color: #6B7280; }
.tab-btn.active { background: #ffffff; color: #000; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.input-group { display: flex; align-items: center; border: 1px solid #E5E7EB; border-radius: 20px; padding: 8px 16px; margin-bottom: 20px; background: white; }
.icon-section { display: flex; align-items: center; justify-content: center; min-width: 40px; }
.divider { width: 1px; height: 30px; background-color: #E5E7EB; margin: 0 15px; }
.input-field { flex: 1; display: flex; flex-direction: column; text-align: left; }
.input-field label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; font-weight: 700; }
.input-field input { border: none; outline: none; font-size: 14px; font-weight: 600; color: #000; }
.btn-submit { width: 100%; padding: 16px; background-color: #0097B2; color: white; border: none; border-radius: 14px; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 20px; }
.image-container { flex: 1; background: linear-gradient(180deg, #095a63 0%, #0097B2 100%); display: flex; align-items: center; justify-content: center; }
.side-image { width: 85%; object-fit: contain; }
@media (max-width: 900px) { .image-container { display: none; } }
</style>