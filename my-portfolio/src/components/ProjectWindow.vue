<script setup>
import { ref, computed, watch } from 'vue';
import { useSwipeGesture } from '../composables/useSwipeGesture.js';

const props = defineProps({
  project: Object,
  theme: String,
  draggable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'show-app-switcher']);

const projectWindowRef = ref(null);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const windowPosition = ref({ x: 100 + Math.random() * 200, y: 50 + Math.random() * 100 });
const windowSize = ref({ width: 500, height: 400 });

// iOS Swipe Gesture - only from bottom area
const { swipeDirection, isSwipeDetected } = useSwipeGesture(projectWindowRef, {
  startArea: { bottom: 60 } // Only allow swipes starting from bottom 60px
});

// Watch for swipe up gesture on iOS
watch([swipeDirection, isSwipeDetected], ([direction, detected]) => {
  if (detected && direction === 'up' && props.theme === 'ios') {
    emit('show-app-switcher');
  }
});

const windowStyle = computed(() => {
  if (props.theme === 'ios') {
    // iOS apps open fullscreen without taskbar
    return {
      position: 'fixed',
      left: '0px',
      top: '44px', // Account for status bar
      width: '100%',
      height: 'calc(100% - 44px)', // Only account for status bar
      zIndex: 100
    };
  }
  
  if (!props.draggable) return {};
  
  return {
    position: 'absolute',
    left: windowPosition.value.x + 'px',
    top: windowPosition.value.y + 'px',
    width: windowSize.value.width + 'px',
    height: windowSize.value.height + 'px',
    zIndex: 100
  };
});

const getImagePosition = (index) => {
  const pos = props.project.imagePositions[index] || { x: 10, y: 10 };
  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: 'translate(-50%, -50%)'
  };
};

// Drag functionality
const startDrag = (e) => {
  if (!props.draggable) return;
  
  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - windowPosition.value.x,
    y: e.clientY - windowPosition.value.y
  };
  
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
};

const drag = (e) => {
  if (!isDragging.value) return;
  
  windowPosition.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  };
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
};
</script>

<template>
  <div class="project-window mb-8" :class="theme + '-theme'" :style="windowStyle" ref="projectWindowRef">
    <div class="title-bar" @mousedown="startDrag">
      <!-- macOS Buttons -->
      <div v-if="theme === 'macos'" class="title-bar-buttons">
        <span class="close" @click="$emit('close')"></span>
        <span class="minimize"></span>
        <span class="maximize"></span>
      </div>
      <!-- iOS Navigation -->
      <div v-else-if="theme === 'ios'" class="ios-nav">
        <div class="ios-spacer"></div>
        <h2 class="ios-title">{{ project.name }}</h2>
        <div class="ios-spacer"></div>
      </div>
      <!-- Default title for other themes -->
      <h2 v-else class="title-bar-text">{{ project.name }}</h2>
      <!-- Windows Buttons -->
      <div v-if="theme === 'windows'" class="title-bar-buttons">
        <span>_</span>
        <span>&#9633;</span>
        <span @click="$emit('close')">X</span>
      </div>
    </div>
    <div class="p-6 relative h-96 overflow-y-auto">
      <p class="text-base mb-4">{{ project.description }}</p>
      <div class="relative h-full">
        <img v-for="(img, index) in project.images" :key="img" :src="img" 
             :style="getImagePosition(index)"
             class="absolute rounded shadow-lg max-w-xs"
             onerror="this.src='https://placehold.co/200x150/2d2d2d/f0f0f0?text=Image+Not+Found'">
      </div>
    </div>
    <!-- iOS Swipe Bar at Bottom -->
    <div v-if="theme === 'ios'" class="ios-swipe-bar">
      <div class="ios-swipe-indicator"></div>
    </div>
  </div>
</template>

<style scoped>
.ios-swipe-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  background: transparent;
  cursor: grab;
  position: relative;
  z-index: 2;
}
.ios-swipe-indicator {
  width: 40px;
  height: 5px;
  background: #cbd5e1;
  border-radius: 3px;
  margin-top: 8px;
}

/* iOS Navigation Bar */
.ios-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 16px;
}

.ios-spacer {
  width: 60px; /* Balance the layout */
}

.ios-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

/* iOS Project Window */
.ios-theme {
  border-radius: 0;
  border: none;
  box-shadow: none;
  background: #f2f2f7;
}

.ios-theme .title-bar {
  background: rgba(248, 248, 248, 0.94);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 44px;
}

.ios-theme .p-6 {
  padding: 16px;
  background: #ffffff;
  height: calc(100% - 44px);
}
</style>

