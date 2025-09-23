<template>
  <div 
    v-if="isVisible" 
    class="app-switcher-overlay"
    @click="$emit('close')"
  >
    <div class="app-switcher-container">
      <!-- Header -->
      <div class="app-switcher-header">
        <h2 class="app-switcher-title">App Switcher</h2>
      </div>
      
      <!-- App Cards -->
      <div class="app-cards-container">
        <div 
          v-for="app in openApps"
          :key="app.id"
          class="app-card"
          @click="switchToApp(app)"
        >
          <!-- App Preview -->
          <div class="app-preview">
            <div class="app-preview-header">
              <div class="app-icon">{{ app.icon }}</div>
              <span class="app-name">{{ app.name }}</span>
              <button 
                class="close-app-btn"
                @click.stop="closeApp(app)"
              >
                ×
              </button>
            </div>
            <div class="app-preview-content">
              <div class="app-preview-placeholder">
                {{ app.type === 'project' ? 'Project View' : 'Text Document' }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Home Screen Card -->
        <div 
          class="app-card home-card"
          @click="goToHome"
        >
          <div class="app-preview">
            <div class="app-preview-header">
              <div class="app-icon">🏠</div>
              <span class="app-name">Home</span>
            </div>
            <div class="app-preview-content home-preview">
              <div class="home-preview-grid">
                <div class="home-app-icon" v-for="n in 12" :key="n">📱</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom indicator -->
      <div class="app-switcher-indicator"></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isVisible: Boolean,
  openApps: Array
})

const emit = defineEmits(['close', 'switch-to-app', 'close-app', 'go-to-home'])

const switchToApp = (app) => {
  emit('switch-to-app', app)
  emit('close')
}

const closeApp = (app) => {
  emit('close-app', app)
}

const goToHome = () => {
  emit('go-to-home')
  emit('close')
}
</script>

<style scoped>
.app-switcher-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
}

.app-switcher-container {
  width: 90%;
  height: 80%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.app-switcher-header {
  text-align: center;
  margin-bottom: 20px;
}

.app-switcher-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.app-cards-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 0 10px;
}

.app-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.app-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
}

.app-card.home-card {
  background: rgba(255, 255, 255, 0.15);
}

.app-preview {
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
}

.app-preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  position: relative;
}

.app-icon {
  font-size: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

.close-app-btn {
  position: absolute;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.close-app-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.app-preview-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.app-preview-placeholder {
  text-align: center;
}

.home-preview {
  background: linear-gradient(180deg, #007AFF 0%, #5856D6 50%, #FF3B30 100%);
}

.home-preview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 4px;
  padding: 8px;
  width: 100%;
  height: 100%;
}

.home-app-icon {
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.app-switcher-indicator {
  width: 134px;
  height: 5px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 3px;
  margin: 20px auto 0;
}

/* Scrollbar styling */
.app-cards-container::-webkit-scrollbar {
  width: 4px;
}

.app-cards-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.app-cards-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.app-cards-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>