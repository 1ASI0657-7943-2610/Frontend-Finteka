<template>
  <div class="messages-container">
    <aside class="chats-sidebar">
      <div class="sidebar-header">
        <h3>Mensajes</h3>
        <span class="badge" v-if="contacts.length > 0">{{ contacts.length }}</span>
      </div>

      <div class="contacts-list">
        <div
            v-for="contact in contacts"
            :key="contact.name"
            class="contact-item"
            :class="{ active: selectedContact?.name === contact.name }"
            @click="selectContact(contact)"
        >
          <div class="avatar-box">
            <img :src="getAvatar(contact.name)" alt="Avatar" />
            <span v-if="contact.online" class="online-dot"></span>
          </div>
          <div class="contact-info">
            <div class="info-top">
              <span class="contact-name">{{ contact.name }}</span>
              <span class="last-time">10:24 AM</span>
            </div>
            <p class="last-msg">{{ contact.lastMsg || 'Haz clic para chatear...' }}</p>
          </div>
        </div>

        <div v-if="contacts.length === 0" class="empty-contacts">
          <div class="empty-icon">📂</div>
          <p>No tienes chats activos.</p>
          <span>Agenda una cita con un experto para habilitar el chat.</span>
        </div>
      </div>
    </aside>

    <main class="chat-window">
      <template v-if="selectedContact">
        <header class="chat-header">
          <div class="header-user">
            <img :src="getAvatar(selectedContact.name)" alt="Expert" />
            <div>
              <h4>{{ selectedContact.name }}</h4>
              <span class="status-text">● En línea</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn">📞</button>
            <button class="action-btn">📹</button>
          </div>
        </header>

        <div class="messages-list" ref="msgList">
          <div
              v-for="(msg, index) in activeMessages"
              :key="index"
              class="message-wrapper"
              :class="msg.sender === 'me' ? 'sent' : 'received'"
          >
            <div class="message-bubble" :class="{ 'file-bubble': msg.type === 'file' }">
              <div v-if="msg.type === 'file'" class="file-content">
                <template v-if="isImage(msg.fileName)">
                  <img :src="msg.fileData" class="chat-img-preview" @click="openFile(msg.fileData)" />
                </template>
                <div v-else class="doc-preview" @click="openFile(msg.fileData)">
                  <span class="file-icon">{{ getFileIcon(msg.fileName) }}</span>
                  <div class="file-details">
                    <span class="file-name">{{ msg.fileName }}</span>
                    <span class="file-action">Ver documento</span>
                  </div>
                </div>
              </div>
              <span v-else>{{ msg.text }}</span>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
          </div>

          <div v-if="isTyping" class="typing-indicator">
            {{ selectedContact.name }} está escribiendo<span>.</span><span>.</span><span>.</span>
          </div>
        </div>

        <footer class="chat-footer">
          <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              style="display: none"
              accept=".pdf,.doc,.docx,.txt,image/*"
          />
          <button class="attach-btn" @click="$refs.fileInput.click()">📎</button>
          <input
              type="text"
              v-model="newMessage"
              placeholder="Escribe un mensaje..."
              @keyup.enter="sendMessage"
          />
          <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </footer>
      </template>

      <div v-else class="no-selection">
        <div class="no-selection-content">
          <div class="icon-circle">💬</div>
          <h3>Tus conversaciones</h3>
          <p>Selecciona a un asesor de la izquierda para resolver tus dudas o coordinar la sesión.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';

// ✅ Imports correctos con @ para evitar errores de ruta en producción
import manAvatar from '@/assets/user.avatar.png';
import womanAvatar from '@/assets/user-avatar-female.png';

const contacts = ref([]);
const selectedContact = ref(null);
const newMessage = ref('');
const isTyping = ref(false);
const msgList = ref(null);
const fileInput = ref(null);
const allMessages = ref({});

const isImage = (name) => /\.(jpg|jpeg|png|webp|gif)$/i.test(name);

const getFileIcon = (name) => {
  if (name.endsWith('.pdf')) return '📕';
  if (name.includes('.doc')) return '📘';
  return '📄';
};

const getAvatar = (name) => {
  const femaleNames = ['mia', 'maria', 'ana', 'sofia', 'lucia'];
  const isFemale = femaleNames.some(f => name.toLowerCase().includes(f));
  return isFemale ? womanAvatar : manAvatar;
};

const activeMessages = computed(() => {
  if (!selectedContact.value) return [];
  return allMessages.value[selectedContact.value.name] || [];
});

const loadData = () => {
  const reservas = JSON.parse(localStorage.getItem('finteka_reservas') || '[]');
  const uniqueNames = [...new Set(reservas.map(r => r.expertName))];

  contacts.value = uniqueNames.map(name => {
    const res = reservas.find(r => r.expertName === name);
    return { name, specialty: res.specialty, lastMsg: '¡Hola! ¿Cómo estás?', online: true };
  });

  const savedMsgs = JSON.parse(localStorage.getItem('finteka_chat_history') || '{}');
  allMessages.value = savedMsgs;
};

const selectContact = (contact) => {
  selectedContact.value = contact;
  if (!allMessages.value[contact.name]) {
    allMessages.value[contact.name] = [
      {
        sender: 'them',
        text: `Hola, soy ${contact.name}. Gracias por reservar una asesoría de ${contact.specialty}. ¿En qué puedo ayudarte?`,
        time: 'Hace un momento'
      }
    ];
    saveHistory();
  }
  scrollToBottom();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileMsg = {
      sender: 'me',
      type: 'file',
      fileName: file.name,
      fileData: e.target.result,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    if (!allMessages.value[selectedContact.value.name]) {
      allMessages.value[selectedContact.value.name] = [];
    }
    allMessages.value[selectedContact.value.name].push(fileMsg);
    saveHistory();
    scrollToBottom();
    simulateBotResponse(`He recibido tu archivo: ${file.name}. Lo revisaré para nuestra sesión.`);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
};

const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  const text = newMessage.value;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!allMessages.value[selectedContact.value.name]) {
    allMessages.value[selectedContact.value.name] = [];
  }
  allMessages.value[selectedContact.value.name].push({ sender: 'me', text, time });

  const currentText = newMessage.value;
  newMessage.value = '';
  saveHistory();
  scrollToBottom();
  simulateBotResponse(`¡Entendido! Recibí tu consulta: "${currentText}". Dame unos minutos para revisar el material y te respondo a detalle.`);
};

const simulateBotResponse = (responseText) => {
  setTimeout(() => {
    isTyping.value = true;
    scrollToBottom();
    setTimeout(() => {
      isTyping.value = false;
      allMessages.value[selectedContact.value.name].push({
        sender: 'them',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      saveHistory();
      scrollToBottom();
    }, 2000);
  }, 1000);
};

const openFile = (base64Data) => {
  const win = window.open();
  win.document.write(`<iframe src="${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
};

const saveHistory = () => {
  localStorage.setItem('finteka_chat_history', JSON.stringify(allMessages.value));
};

const scrollToBottom = async () => {
  await nextTick();
  if (msgList.value) msgList.value.scrollTop = msgList.value.scrollHeight;
};

onMounted(loadData);
</script>

<style scoped>
.messages-container { display: flex; height: calc(100vh - 120px); background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; margin: 0 40px 40px 40px; font-family: 'Poppins', sans-serif; }
.chats-sidebar { width: 350px; background: #F9FAFB; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; }
.sidebar-header { padding: 24px; display: flex; align-items: center; justify-content: space-between; }
.sidebar-header h3 { font-size: 20px; font-weight: 800; color: #1F2937; margin: 0; }
.badge { background: #0097B2; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
.contacts-list { flex: 1; overflow-y: auto; }
.contact-item { display: flex; padding: 20px 24px; gap: 14px; cursor: pointer; border-bottom: 1px solid #F3F4F6; transition: 0.2s; }
.contact-item:hover { background: #F3F4F6; }
.contact-item.active { background: #FFFFFF; box-shadow: inset 4px 0 0 #0097B2; }
.avatar-box { position: relative; width: 48px; height: 48px; }
.avatar-box img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.online-dot { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #10B981; border: 2px solid #F9FAFB; border-radius: 50%; }
.contact-info { flex: 1; min-width: 0; }
.info-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.contact-name { font-weight: 700; font-size: 14px; color: #1F2937; }
.last-time { font-size: 11px; color: #9CA3AF; }
.last-msg { font-size: 13px; color: #6B7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-window { flex: 1; display: flex; flex-direction: column; background: #FFFFFF; }
.chat-header { padding: 18px 30px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; }
.header-user { display: flex; align-items: center; gap: 12px; }
.header-user img { width: 42px; height: 42px; border-radius: 50%; }
.header-user h4 { margin: 0; font-size: 16px; font-weight: 700; color: #1F2937; }
.status-text { font-size: 12px; color: #10B981; font-weight: 600; }
.action-btn { background: none; border: none; font-size: 18px; cursor: pointer; padding: 8px; border-radius: 8px; transition: 0.2s; }
.action-btn:hover { background: #F3F4F6; }
.messages-list { flex: 1; padding: 30px; overflow-y: auto; background: #FFFFFF; display: flex; flex-direction: column; gap: 15px; }
.message-wrapper { display: flex; width: 100%; }
.message-wrapper.sent { justify-content: flex-end; }
.message-bubble { max-width: 65%; padding: 12px 18px; border-radius: 18px; font-size: 14px; position: relative; line-height: 1.5; }
.sent .message-bubble { background: #0097B2; color: white; border-bottom-right-radius: 4px; }
.received .message-bubble { background: #F3F4F6; color: #374151; border-bottom-left-radius: 4px; }
.file-bubble { min-width: 220px; cursor: pointer; }
.chat-img-preview { width: 100%; border-radius: 12px; margin-bottom: 8px; display: block; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.doc-preview { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 12px; }
.received .doc-preview { background: rgba(0,0,0,0.05); }
.file-icon { font-size: 24px; }
.file-details { display: flex; flex-direction: column; overflow: hidden; }
.file-name { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-action { font-size: 10px; opacity: 0.8; }
.msg-time { font-size: 10px; opacity: 0.7; display: block; margin-top: 6px; text-align: right; }
.chat-footer { padding: 20px 30px; display: flex; gap: 15px; align-items: center; border-top: 1px solid #E5E7EB; }
.chat-footer input { flex: 1; padding: 14px 20px; border: 1px solid #E5E7EB; border-radius: 14px; outline: none; font-family: inherit; font-size: 14px; transition: 0.2s; }
.chat-footer input:focus { border-color: #0097B2; box-shadow: 0 0 0 3px rgba(0, 151, 178, 0.1); }
.send-btn { background: #0097B2; color: white; border: none; width: 48px; height: 48px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.send-btn:hover:not(:disabled) { background: #007A8F; transform: scale(1.05); }
.send-btn:disabled { opacity: 0.5; }
.send-btn svg { width: 22px; height: 22px; }
.attach-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #9CA3AF; transition: 0.2s; }
.attach-btn:hover { color: #0097B2; transform: scale(1.1); }
.no-selection { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; color: #9CA3AF; }
.icon-circle { width: 90px; height: 90px; background: #F0FBFC; color: #0097B2; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 44px; margin: 0 auto 24px; }
.no-selection h3 { color: #1F2937; font-weight: 800; margin-bottom: 8px; }
.empty-contacts { text-align: center; padding: 40px 20px; color: #9CA3AF; }
.empty-icon { font-size: 40px; margin-bottom: 15px; opacity: 0.5; }
.empty-contacts p { font-weight: 700; color: #4B5563; margin-bottom: 5px; }
.empty-contacts span { font-size: 12px; line-height: 1.4; display: block; }
.typing-indicator { font-size: 12px; color: #9CA3AF; font-style: italic; margin-top: 5px; }
</style>