<template>
  <div 
    v-if="isVisible" 
    class="app-switcher-overlay"
    @click="handleOverlayClick"
  >
    <div class="app-switcher-container">
      <!-- App Cards Scrollable Container -->
      <div class="app-cards-scroll-container">
        <div class="app-cards-wrapper">
          <!-- Individual App Cards -->
          <div 
            v-for="app in openApps"
            :key="app.id"
            ref="appCardRefs"
            class="app-card"
            :class="{ 'background-app': !app.isActive, 'foreground-app': app.isForeground }"
            @click="switchToApp(app)"
          >
            <!-- App Header -->
            <div class="app-card-header">
              <div class="app-info">
                <div class="app-icon-small">{{ app.icon }}</div>
                <span class="app-title">{{ app.name }}</span>
              </div>
            </div>
            
            <!-- App Preview Screen -->
            <div class="app-screen">
              <div class="screen-content">
                <div v-if="!app.isActive" class="background-state">
                  <div class="background-indicator">⏸</div>
                  <span class="background-text">Background</span>
                </div>
                <div v-else class="active-content">
                  {{ app.type === 'project' ? 'Project View' : 'Text Document' }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Home Card -->
          <div 
            class="app-card home-card"
            @click="goToHome"
          >
            <div class="app-card-header">
              <div class="app-info">
                <div class="app-icon-small">🏠</div>
                <span class="app-title">Home</span>
              </div>
            </div>
            
            <div class="app-screen home-screen">
              <div class="home-grid">
                <div class="home-app-dot" v-for="n in 16" :key="n"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom Home Indicator -->
      <div class="switcher-home-indicator"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useSwipeGesture } from '../composables/useSwipeGesture.js'

const props = defineProps({
  isVisible: Boolean,
  openApps: Array
})

const emit = defineEmits(['close', 'switch-to-app', 'close-app', 'go-to-home'])

const appCardRefs = ref([])

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

const handleOverlayClick = (e) => {
  // Only close if clicking the overlay itself, not the cards
  if (e.target.classList.contains('app-switcher-overlay')) {
    emit('close')
  }
}

// Individual card swipe handling
let cardSwipeDetectors = []

const setupCardSwipeDetection = () => {
  // Clear existing detectors
  cardSwipeDetectors.forEach(detector => {
    if (detector.removeSwipeListeners) {
      detector.removeSwipeListeners()
    }
  })
  cardSwipeDetectors = []

  // Setup swipe detection for each app card
  if (appCardRefs.value.length > 0) {
    appCardRefs.value.forEach((cardElement, index) => {
      if (cardElement && props.openApps[index]) {
        const app = props.openApps[index]
        const cardRef = ref(cardElement)
        
        const { swipeDirection, isSwipeDetected } = useSwipeGesture(cardRef, {
          threshold: 60,
          restraint: 150,
          allowedTime: 400
        })

        // Watch for swipe up on this specific card
        const stopWatcher = watch([swipeDirection, isSwipeDetected], ([direction, detected]) => {
          if (detected && direction === 'up') {
            closeApp(app)
          }
        })

        cardSwipeDetectors.push({
          stopWatcher,
          removeSwipeListeners: () => stopWatcher()
        })
      }
    })
  }
}

// Watch for changes in app list to setup swipe detection
watch(() => props.openApps, () => {
  if (props.isVisible) {
    nextTick(() => {
      setupCardSwipeDetection()
    })
  }
}, { deep: true })

watch(() => props.isVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      setupCardSwipeDetection()
    })
  } else {
    // Cleanup when hidden
    cardSwipeDetectors.forEach(detector => {
      if (detector.removeSwipeListeners) {
        detector.removeSwipeListeners()
      }
    })
    cardSwipeDetectors = []
  }
})

onUnmounted(() => {
  cardSwipeDetectors.forEach(detector => {
    if (detector.removeSwipeListeners) {
      detector.removeSwipeListeners()
    }
  })
})
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
  backdrop-filter: blur(20px);
}

.app-switcher-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 60px 0 40px;
}

.app-cards-scroll-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 20px 0;
}

.app-cards-wrapper {
  display: flex;
  gap: 16px;
  padding: 0 20px;
  min-width: max-content;
  align-items: center;
  height: 100%;
}

.app-card {
  width: 280px;
  height: 500px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  flex-shrink: 0;
}

.app-card:hover {
  transform: scale(1.02);
}

.app-card.background-app {
  opacity: 0.8;
  filter: grayscale(0.3);
}

.app-card.foreground-app {
  border: 3px solid #007AFF;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.4);
}

.app-card.home-card {
  background: linear-gradient(180deg, #007AFF 0%, #5856D6 50%, #FF3B30 100%);
}

.app-card-header {
  padding: 12px 16px;
  background: rgba(248, 248, 248, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.app-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-icon-small {
  font-size: 16px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-title {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.app-screen {
  height: calc(100% - 50px);
  background: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.background-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.background-indicator {
  font-size: 32px;
  color: #FF9500;
}

.background-text {
  font-size: 12px;
  color: #FF9500;
  font-weight: 600;
  text-transform: uppercase;
}

.active-content {
  color: #333;
  font-weight: 500;
}

.home-screen {
  background: linear-gradient(180deg, #007AFF 0%, #5856D6 50%, #FF3B30 100%);
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 12px;
  padding: 40px;
  width: 200px;
  height: 200px;
}

.home-app-dot {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  width: 100%;
  height: 100%;
}

.switcher-home-indicator {
  width: 134px;
  height: 5px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 3px;
  margin: 0 auto;
}

/* Custom scrollbar for horizontal scroll */
.app-cards-scroll-container::-webkit-scrollbar {
  height: 4px;
}

.app-cards-scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.app-cards-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

.app-cards-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.6);
}
</style>