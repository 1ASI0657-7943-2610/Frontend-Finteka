<template>
  <div class="login-page">
    <div class="form-container">
      <div class="form-content">
        <h1 class="logo">Fin<span>Teka</span></h1>

        <div class="header-text">
          <h2>Bienvenido de nuevo</h2>
          <p>Por favor ingresa tus datos</p>
        </div>

        <div class="auth-tabs">
          <button class="tab-btn active">Iniciar sesión</button>
          <button class="tab-btn" @click="$router.push('/signup')">Registrarse</button>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
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
              <input v-model="email" type="email" placeholder="fideito.1mp@gmail.com" required />
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
              <label>Client</label>
              <input v-model="client" type="password" placeholder="****************" required />
            </div>
          </div>

          <p v-if="errorMessage" style="color: #DC2626; font-size: 13px; margin: -5px 0 10px 0; font-weight: 500;">
            {{ errorMessage }}
          </p>

          <button type="submit" class="btn-submit" :disabled="isLoading">
            {{ isLoading ? 'Cargando...' : 'Iniciar sesión' }}
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import http from '../../shared/services/http-common.js';

const router = useRouter();
const email = ref('');
const password = ref('');
const client = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

onMounted(() => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('finteka_user_profile');
  localStorage.removeItem('userName');
  localStorage.removeItem('profileId');
  localStorage.removeItem('name');
  localStorage.removeItem('user');
});

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Completa el email y la contraseña.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await http.get('/api/auth', {
      params: { email: email.value, password: password.value }
    });

    const res = response.data;

    // ✅ El backend devuelve success:false si las credenciales son incorrectas
    if (!res.success) {
      errorMessage.value = res.message || 'Credenciales incorrectas.';
      return;
    }

    const id = res.profileId;
    const name = res.name || 'Usuario';

    // ✅ Guarda en todas las claves necesarias
    localStorage.setItem('profileId', id);
    localStorage.setItem('name', name);
    localStorage.setItem('user', JSON.stringify(res));
    localStorage.setItem('auth_token', String(id));
    localStorage.setItem('finteka_user_profile', JSON.stringify({
      id,
      name,
      email: email.value,
      avatar: '/user-avatar.png'
    }));
    localStorage.setItem('userName', name);

    window.dispatchEvent(new Event('profile-updated'));
    router.push('/dashboard');

  } catch (error) {
    console.error('❌ Error en login:', error.response?.status, error.response?.data || error.message);
    errorMessage.value = 'Error de conexión con el servidor.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-page { display: flex; height: 100vh; width: 100vw; font-family: 'Poppins', sans-serif; background-color: #ffffff; overflow: hidden; }
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