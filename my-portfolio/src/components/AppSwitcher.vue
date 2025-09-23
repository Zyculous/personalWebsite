<template>
  <div 
    v-if="isVisible" 
    class="app-switcher-overlay"
    @click="handleOverlayClick"
  >
    <div class="app-switcher-container">
      <!-- Keyboard Shortcuts Info -->
      <div class="keyboard-shortcuts">
        <span>← → Navigate</span>
        <span>↑ Close App</span>
        <span>Enter/Space Select</span>
        <span>Esc Exit</span>
      </div>
      
      <!-- App Cards Scrollable Container -->
      <div class="app-cards-scroll-container">
        <div class="app-cards-wrapper">
          <!-- Individual App Cards -->
          <div 
            v-for="(app, index) in openApps"
            :key="app.id"
            ref="appCardRefs"
            class="app-card"
            :class="{ 
              'background-app': !app.isActive, 
              'foreground-app': app.isForeground,
              'selected-card': selectedCardIndex === index
            }"
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
            :class="{ 'selected-card': selectedCardIndex === openApps.length }"
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

const props = defineProps({
  isVisible: Boolean,
  openApps: Array
})

const emit = defineEmits(['close', 'switch-to-app', 'close-app', 'go-to-home'])

const appCardRefs = ref([])
const selectedCardIndex = ref(0) // Track which card is currently selected

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

// Keyboard navigation for app switcher
const handleKeyDown = (event) => {
  if (!props.isVisible) return

  const totalCards = props.openApps.length + 1 // +1 for home card
  
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      selectedCardIndex.value = selectedCardIndex.value > 0 
        ? selectedCardIndex.value - 1 
        : totalCards - 1
      scrollToSelectedCard()
      break
      
    case 'ArrowRight':
      event.preventDefault()
      selectedCardIndex.value = selectedCardIndex.value < totalCards - 1 
        ? selectedCardIndex.value + 1 
        : 0
      scrollToSelectedCard()
      break
      
    case 'ArrowUp':
      event.preventDefault()
      // Close the selected app if it's not the home card
      if (selectedCardIndex.value < props.openApps.length) {
        const selectedApp = props.openApps[selectedCardIndex.value]
        closeAppWithAnimation(selectedApp, selectedCardIndex.value)
      }
      break
      
    case 'Enter':
    case ' ': // Spacebar
      event.preventDefault()
      // Switch to selected app or go home
      if (selectedCardIndex.value < props.openApps.length) {
        const selectedApp = props.openApps[selectedCardIndex.value]
        switchToApp(selectedApp)
      } else {
        goToHome()
      }
      break
      
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

const scrollToSelectedCard = () => {
  nextTick(() => {
    const container = document.querySelector('.app-cards-scroll-container')
    if (container && appCardRefs.value[selectedCardIndex.value]) {
      const selectedCard = appCardRefs.value[selectedCardIndex.value]
      if (selectedCard) {
        selectedCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        })
      }
    }
  })
}

const closeAppWithAnimation = (app, cardIndex) => {
  const cardElement = appCardRefs.value[cardIndex]
  if (cardElement) {
    // Apply exit animation
    cardElement.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    cardElement.style.transform = 'translateY(-600px) scale(0.8)'
    cardElement.style.opacity = '0'
    
    setTimeout(() => {
      closeApp(app)
      // Adjust selected index if needed after app closes
      if (selectedCardIndex.value >= props.openApps.length) {
        selectedCardIndex.value = Math.max(0, props.openApps.length - 1)
      }
    }, 300)
  } else {
    // Fallback if no card element
    closeApp(app)
  }
}

// Enhanced swipe handling with CSS transitions
const setupCardSwipeDetection = () => {
  if (!appCardRefs.value.length) return

  appCardRefs.value.forEach((cardElement, index) => {
    if (!cardElement || !props.openApps[index]) return

    const app = props.openApps[index]
    let startY = 0
    let currentY = 0
    let isTracking = false

    const handleTouchStart = (e) => {
      e.preventDefault()
      isTracking = true
      startY = e.touches[0].clientY
      currentY = startY
      
      console.log('Touch start on card:', app.name, 'at Y:', startY)
      
      // Disable transitions for real-time movement
      cardElement.style.transition = 'none'
    }

    const handleTouchMove = (e) => {
      if (!isTracking) return
      e.preventDefault()
      
      currentY = e.touches[0].clientY
      const deltaY = startY - currentY // Positive for upward swipe
      
      console.log('Touch move deltaY:', deltaY)
      
      // Only allow upward movement
      if (deltaY > 0) {
        const progress = Math.min(deltaY / 200, 1) // Max progress at 200px
        const translateY = -deltaY
        const scale = 1 - (progress * 0.1) // Slightly scale down
        const opacity = 1 - (progress * 0.3) // Fade out slightly
        
        // Apply real-time transformation
        cardElement.style.transform = `translateY(${translateY}px) scale(${scale})`
        cardElement.style.opacity = opacity
      }
    }

    const handleTouchEnd = (e) => {
      if (!isTracking) return
      isTracking = false
      
      const deltaY = startY - currentY
      const threshold = 120 // Threshold for closing
      
      console.log('Touch end deltaY:', deltaY, 'threshold:', threshold)
      
      if (deltaY > threshold) {
        console.log('Closing app:', app.name)
        // Animate card out and close app
        cardElement.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        cardElement.style.transform = 'translateY(-600px) scale(0.8)'
        cardElement.style.opacity = '0'
        
        setTimeout(() => {
          closeApp(app)
        }, 300)
      } else {
        console.log('Resetting card position')
        // Animate back to original position
        cardElement.style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        cardElement.style.transform = 'translateY(0px) scale(1)'
        cardElement.style.opacity = '1'
      }
    }

    // Add touch event listeners
    cardElement.addEventListener('touchstart', handleTouchStart, { passive: false })
    cardElement.addEventListener('touchmove', handleTouchMove, { passive: false })
    cardElement.addEventListener('touchend', handleTouchEnd, { passive: false })
    
    // Store cleanup function
    cardElement._cleanup = () => {
      cardElement.removeEventListener('touchstart', handleTouchStart)
      cardElement.removeEventListener('touchmove', handleTouchMove) 
      cardElement.removeEventListener('touchend', handleTouchEnd)
    }
  })
}

const cleanupSwipeDetection = () => {
  appCardRefs.value.forEach(cardElement => {
    if (cardElement && cardElement._cleanup) {
      cardElement._cleanup()
    }
  })
}

// Watch for changes in app list to setup swipe detection
watch(() => props.openApps, () => {
  if (props.isVisible) {
    nextTick(() => {
      cleanupSwipeDetection()
      setupCardSwipeDetection()
    })
  }
}, { deep: true })

watch(() => props.isVisible, (visible) => {
  if (visible) {
    // Reset selection when app switcher opens
    selectedCardIndex.value = 0
    nextTick(() => {
      setupCardSwipeDetection()
    })
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown)
  } else {
    cleanupSwipeDetection()
    // Remove keyboard event listener
    document.removeEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  cleanupSwipeDetection()
  // Ensure keyboard event listener is removed
  document.removeEventListener('keydown', handleKeyDown)
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

.keyboard-shortcuts {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin: 0 20px 20px;
  backdrop-filter: blur(10px);
}

.keyboard-shortcuts span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
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
  transition: none; /* Disable CSS transitions for manual anime.js control */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  flex-shrink: 0;
  touch-action: none; /* Prevent default touch behaviors */
  user-select: none; /* Prevent text selection during swipe */
}

.app-card:hover {
  transform: scale(1.02);
}

.app-card:active {
  transform: scale(0.98);
}

.app-card.background-app {
  opacity: 0.8;
  filter: grayscale(0.3);
}

.app-card.foreground-app {
  border: 3px solid #007AFF;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.4);
}

.app-card.selected-card {
  border: 3px solid #FFD700;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.6);
  transform: scale(1.05);
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