<script setup>
import { ref } from 'vue';
const props = defineProps({
  project: Object,
  theme: String
});
const emit = defineEmits(['close']);

const getImagePosition = (index) => {
  const pos = props.project.imagePositions[index] || { x: 10, y: 10 };
  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: 'translate(-50%, -50%)'
  };
};

// iOS swipe-to-close logic
const startY = ref(null);
const deltaY = ref(0);
const threshold = 80; // px to trigger close
const windowRef = ref(null);

const onTouchStart = (e) => {
  if (e.touches && e.touches.length === 1) {
    startY.value = e.touches[0].clientY;
    deltaY.value = 0;
  }
};
const onTouchMove = (e) => {
  if (startY.value !== null && e.touches && e.touches.length === 1) {
    e.preventDefault(); // Prevent main page scroll
    deltaY.value = e.touches[0].clientY - startY.value;
    if (deltaY.value < 0 && windowRef.value) {
      windowRef.value.style.transform = `translateY(${deltaY.value}px)`;
    }
  }
};
const onTouchEnd = () => {
  if (deltaY.value < -threshold) {
    emit('close');
  } else if (windowRef.value) {
    windowRef.value.style.transform = '';
  }
  startY.value = null;
  deltaY.value = 0;
};
// Mouse fallback for desktop
let mouseStartY = null;
let mouseDragging = false;
const onMouseDown = (e) => {
  if (props.theme === 'ios') {
    mouseStartY = e.clientY;
    mouseDragging = true;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
};
const onMouseMove = (e) => {
  if (mouseDragging && windowRef.value) {
    const moveY = e.clientY - mouseStartY;
    if (moveY < 0) {
      windowRef.value.style.transform = `translateY(${moveY}px)`;
    }
  }
};
const onMouseUp = (e) => {
  if (mouseDragging) {
    const moveY = e.clientY - mouseStartY;
    if (moveY < -threshold) {
      emit('close');
    } else if (windowRef.value) {
      windowRef.value.style.transform = '';
    }
    mouseDragging = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }
};
</script>

<template>
  <div class="project-window mb-8" :class="theme + '-theme'" ref="windowRef">
    <div class="title-bar">
      <!-- macOS Buttons -->
      <div v-if="theme === 'macos'" class="title-bar-buttons">
        <span class="close" @click="$emit('close')"></span>
        <span class="minimize"></span>
        <span class="maximize"></span>
      </div>
      <h2 class="title-bar-text">{{ project.name }}</h2>
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
    <div v-if="theme === 'ios'" class="ios-swipe-bar" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @mousedown="onMouseDown">
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
</style>

