<template>
  <header class="topbar">
    <div class="search-container">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" placeholder="Buscar expertos, especialidades..." class="search-input"/>
    </div>

    <div class="topbar-right">
      <div class="balance-display">
        <div class="wallet-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="M16 8h6"></path>
            <circle cx="16" cy="12" r="2"></circle>
          </svg>
        </div>
        <div class="balance-info">
          <label>Tu Saldo</label>
          <span>S/ {{ userBalance.toFixed(2) }}</span>
        </div>
        <button class="btn-top-up" @click="isPaymentModalOpen = true" title="Recargar saldo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div class="profile-wrapper">
        <div class="user-profile" @click="isDropdownOpen = !isDropdownOpen">
          <img :src="userAvatar" alt="Usuario" class="avatar" />
          <span class="user-name">{{ userName }}</span>
          <svg :class="{'chevron-open': isDropdownOpen}" class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        <div v-if="isDropdownOpen" class="dropdown-menu">
          <div class="dropdown-item" @click="navigate('/perfil')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Mi Perfil
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item text-red" @click="navigate('/login')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Cerrar Sesión
          </div>
        </div>
      </div>
    </div>

    <div v-if="isPaymentModalOpen" class="modal-overlay" @click.self="isPaymentModalOpen = false">
      <div class="payment-modal">
        <div class="modal-header-payment">
          <h3>Pasarela de Pago</h3>
          <button @click="isPaymentModalOpen = false" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <div class="card-preview">
            <div class="chip"></div>
            <div class="card-number-display">{{ cardData.number || '**** **** **** ****' }}</div>
            <div class="card-bottom">
              <span>{{ cardData.name || 'NOMBRE DEL TITULAR' }}</span>
              <span>{{ cardData.expiry || 'MM/AA' }}</span>
            </div>
          </div>

          <div class="payment-form">
            <div class="form-group">
              <label>Monto a recargar (S/)</label>
              <input type="number" v-model="cardData.amount" class="pay-input" />
            </div>
            <div class="form-group">
              <label>Número de tarjeta</label>
              <input type="text" v-model="cardData.number" maxlength="16" placeholder="0000 0000 0000 0000" class="pay-input" />
            </div>
            <div class="row-inputs">
              <div class="form-group">
                <label>Expiración</label>
                <input type="text" v-model="cardData.expiry" placeholder="MM/AA" maxlength="5" class="pay-input" />
              </div>
              <div class="form-group">
                <label>CVV (Seguridad)</label>
                <input type="text" v-model="cardData.cvv" placeholder="123" maxlength="3" class="pay-input" />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer-payment">
          <button class="btn-cancel-pay" @click="isPaymentModalOpen = false">Cancelar</button>
          <button class="btn-confirm-pay" @click="processPayment">Procesar Pago</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isDropdownOpen = ref(false);
const isPaymentModalOpen = ref(false);
const userName = ref('Tom Riddle');
const userAvatar = ref('/user-avatar.png');
const userBalance = ref(500.00);

const cardData = reactive({
  number: '',
  name: '',
  expiry: '',
  cvv: '',
  amount: 100
});

const navigate = (path) => {
  isDropdownOpen.value = false;
  router.push(path);
};

const processPayment = () => {
  if (cardData.number.length < 16 || cardData.cvv.length < 3) {
    alert("Datos de tarjeta incompletos.");
    return;
  }
  const current = parseFloat(localStorage.getItem('finteka_user_balance') || '0');
  const nuevoSaldo = current + parseFloat(cardData.amount);
  localStorage.setItem('finteka_user_balance', nuevoSaldo.toFixed(2));
  userBalance.value = nuevoSaldo;

  const actualesNotif = JSON.parse(localStorage.getItem('finteka_notificaciones') || '[]');
  actualesNotif.unshift({
    id: Date.now(),
    type: 'Sistema',
    text: `¡Recarga exitosa! S/ ${cardData.amount}.00 abonados mediante tarjeta *${cardData.number.slice(-4)}.`,
    date: new Date().toLocaleDateString(),
    read: false
  });
  localStorage.setItem('finteka_notificaciones', JSON.stringify(actualesNotif));

  isPaymentModalOpen.value = false;
  alert("¡Pago aprobado!");
};

const loadProfileData = () => {
  const savedProfile = localStorage.getItem('finteka_user_profile');
  if (savedProfile) {
    const data = JSON.parse(savedProfile);
    userName.value = data.name || 'Tom Riddle';
    if (data.avatar) userAvatar.value = data.avatar;
  }
  const savedBalance = localStorage.getItem('finteka_user_balance');
  if (savedBalance === null) {
    localStorage.setItem('finteka_user_balance', '500.00');
    userBalance.value = 500.00;
  } else {
    userBalance.value = parseFloat(savedBalance);
  }
};

onMounted(() => {
  loadProfileData();
  window.addEventListener('profile-updated', loadProfileData);
  window.addEventListener('balance-updated', loadProfileData);
});

onUnmounted(() => {
  window.removeEventListener('profile-updated', loadProfileData);
  window.removeEventListener('balance-updated', loadProfileData);
});
</script>

<style scoped>
.topbar { height: 80px; background-color: #ffffff; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; border-bottom: 1px solid #E5E7EB; font-family: 'Poppins', sans-serif; }
.topbar-right { display: flex; align-items: center; gap: 30px; }

/* BILLETERA */
.balance-display { display: flex; align-items: center; gap: 12px; background: #F0FBFC; padding: 8px 16px; border-radius: 12px; border: 1px solid #B2E7EF; }
.wallet-icon { color: #0097B2; }
.wallet-icon svg { width: 22px; height: 22px; }
.balance-info { display: flex; flex-direction: column; }
.balance-info label { font-size: 10px; color: #6B7280; font-weight: 700; text-transform: uppercase; margin-bottom: -2px; }
.balance-info span { font-size: 15px; font-weight: 800; color: #1F2937; }

.btn-top-up { background: #0097B2; border: none; border-radius: 50%; width: 24px; height: 24px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: 5px; transition: 0.2s; }
.btn-top-up:hover { transform: scale(1.1); background: #007A8F; }

/* MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.payment-modal { background: white; border-radius: 20px; width: 420px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.modal-header-payment { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header-payment h3 { font-weight: 800; margin: 0; color: #1F2937; }
.close-btn { background: none; border: none; font-size: 26px; color: #9CA3AF; cursor: pointer; }

/* CARD PREVIEW */
.card-preview { background: linear-gradient(135deg, #1F2937 0%, #111827 100%); border-radius: 15px; padding: 25px; color: white; margin-bottom: 25px; height: 170px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
.chip { width: 45px; height: 35px; background: #D1D5DB; border-radius: 6px; }
.card-number-display { font-size: 19px; letter-spacing: 3px; font-family: 'Courier New', monospace; }
.card-bottom { display: flex; justify-content: space-between; font-size: 12px; text-transform: uppercase; }

/* FORMULARIO - AQUÍ ESTÁ EL FIX */
.row-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 700; color: #4B5563; text-transform: uppercase; }

.pay-input {
  width: 100%; /* FIX: Esto obliga al input a quedarse en su sitio */
  box-sizing: border-box; /* FIX: Asegura que el padding no sume ancho extra */
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  outline: none;
  font-family: inherit;
  font-size: 14px;
}
.pay-input:focus { border-color: #0097B2; }

.modal-footer-payment { display: flex; gap: 15px; margin-top: 25px; }
.btn-cancel-pay { flex: 1; padding: 12px; border: none; background: #F3F4F6; border-radius: 12px; font-weight: 600; cursor: pointer; }
.btn-confirm-pay { flex: 2; padding: 12px; border: none; background: #0097B2; color: white; border-radius: 12px; font-weight: 700; cursor: pointer; }

/* SEARCH & PROFILE (ORIGINAL) */
.search-container { display: flex; align-items: center; background-color: #F3F4F6; padding: 10px 20px; border-radius: 20px; width: 400px; }
.search-input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; }
.search-icon { width: 18px; height: 18px; color: #9CA3AF; margin-right: 10px; }
.profile-wrapper { position: relative; }
.user-profile { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: #eee; }
.user-name { color: #4B5563; font-weight: 500; font-size: 14px; }
.chevron { width: 16px; height: 16px; transition: transform 0.2s; }
.chevron-open { transform: rotate(180deg); }
.dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 10px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); width: 200px; z-index: 100; }
.dropdown-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; font-size: 14px; color: #4B5563; }
.dropdown-item:hover { background: #F3F4F6; }
.dropdown-divider { height: 1px; background: #E5E7EB; }
.text-red { color: #DC2626; }
.dropdown-item svg { width: 18px; height: 18px; }
</style>