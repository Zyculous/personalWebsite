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

const emit = defineEmits(['close', 'show-app-switcher', 'minimize']);

const projectWindowRef = ref(null);
const isDragging = ref(false);
const isResizing = ref(false);
const resizeDirection = ref('');
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
    // iOS apps open fullscreen
    return {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
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
  isResizing.value = false;
  resizeDirection.value = '';
  document.body.style.cursor = 'default';
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopDrag);
};

// Resize functionality
const startResize = (direction, event) => {
  if (!props.draggable) return;
  
  isResizing.value = true;
  resizeDirection.value = direction;
  event.stopPropagation();
  
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopDrag);
  
  // Set cursor based on direction
  const cursors = {
    'n': 'n-resize',
    's': 's-resize',
    'e': 'e-resize',
    'w': 'w-resize',
    'ne': 'ne-resize',
    'nw': 'nw-resize',
    'se': 'se-resize',
    'sw': 'sw-resize'
  };
  document.body.style.cursor = cursors[direction] || 'default';
};

const resize = (e) => {
  if (!isResizing.value) return;
  
  const direction = resizeDirection.value;
  const minWidth = 300;
  const minHeight = 200;
  
  let newWidth = windowSize.value.width;
  let newHeight = windowSize.value.height;
  let newX = windowPosition.value.x;
  let newY = windowPosition.value.y;
  
  if (direction.includes('e')) {
    newWidth = Math.max(minWidth, e.clientX - windowPosition.value.x);
  }
  if (direction.includes('w')) {
    const deltaX = e.clientX - windowPosition.value.x;
    if (windowSize.value.width - deltaX >= minWidth) {
      newWidth = windowSize.value.width - deltaX;
      newX = e.clientX;
    }
  }
  if (direction.includes('s')) {
    newHeight = Math.max(minHeight, e.clientY - windowPosition.value.y);
  }
  if (direction.includes('n')) {
    const deltaY = e.clientY - windowPosition.value.y;
    if (windowSize.value.height - deltaY >= minHeight) {
      newHeight = windowSize.value.height - deltaY;
      newY = e.clientY;
    }
  }
  
  windowSize.value.width = newWidth;
  windowSize.value.height = newHeight;
  windowPosition.value.x = newX;
  windowPosition.value.y = newY;
};

// Window actions
const minimizeWindow = () => {
  emit('minimize');
};
</script>

<template>
  <div class="project-window" :class="[
    theme + '-theme',
    { 'mb-8': !draggable, 'draggable-window': draggable }
  ]" :style="windowStyle" ref="projectWindowRef">
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
      <h2 v-else-if="!theme.startsWith('windows')" class="title-bar-text">{{ project.name }}</h2>
      
      <!-- Linux Buttons -->
      <div v-if="theme === 'linux'" class="title-bar-buttons windows-buttons">
        <span @click="minimizeWindow" class="win-button minimize-btn">_</span>
        <span class="win-button maximize-btn">&#9633;</span>
        <span @click="$emit('close')" class="win-button close-btn">X</span>
      </div>
      
      <!-- Windows Buttons - all versions -->
      <div v-if="theme.startsWith('windows')" class="title-bar-buttons windows-buttons" :class="{
        'windows-11-buttons': theme === 'windows-11'
      }">
        <span @click="minimizeWindow" class="win-button minimize-btn">_</span>
        <span class="win-button maximize-btn">&#9633;</span>
        <span @click="$emit('close')" class="win-button close-btn">X</span>
      </div>
    </div>
    <div class="window-content relative overflow-y-auto" :class="{
      'windows-98-content': theme === 'windows-98',
      'windows-xp-content': theme === 'windows-xp',
      'windows-vista-content': theme === 'windows-vista',
      'windows-7-content': theme === 'windows-7',
      'windows-8-content': theme === 'windows-8',
      'windows-10-content': theme === 'windows-10',
      'windows-11-content': theme === 'windows-11',
      'p-6': !theme.startsWith('windows') && theme !== 'ios',
      'ios-content': theme === 'ios'
    }" :style="{ height: theme === 'ios' ? '100%' : 'calc(100% - 32px)' }">
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
    
    <!-- Resize handles for draggable windows (not iOS) -->
    <template v-if="draggable && theme !== 'ios'">
      <!-- Edge handles -->
      <div class="resize-handle resize-n" @mousedown="startResize('n', $event)"></div>
      <div class="resize-handle resize-s" @mousedown="startResize('s', $event)"></div>
      <div class="resize-handle resize-e" @mousedown="startResize('e', $event)"></div>
      <div class="resize-handle resize-w" @mousedown="startResize('w', $event)"></div>
      
      <!-- Corner handles -->
      <div class="resize-handle resize-ne" @mousedown="startResize('ne', $event)"></div>
      <div class="resize-handle resize-nw" @mousedown="startResize('nw', $event)"></div>
      <div class="resize-handle resize-se" @mousedown="startResize('se', $event)"></div>
      <div class="resize-handle resize-sw" @mousedown="startResize('sw', $event)"></div>
    </template>
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

/* Windows Theme Variations */

/* Windows 98 Theme */
.windows-98-theme {
  border: 2px outset #C0C0C0;
  background: #C0C0C0;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.windows-98-theme .title-bar {
  background: linear-gradient(90deg, #0F4080 0%, #4080FF 100%);
  color: white;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  height: 18px;
  padding: 2px 4px;
  border-bottom: 1px solid #808080;
}

.windows-98-theme .win-button {
  background: #C0C0C0;
  border: 1px outset #C0C0C0;
  width: 16px;
  height: 14px;
  font-size: 8px;
  color: black;
  margin: 0 1px;
}

.windows-98-theme .win-button:hover {
  background: #E0E0E0;
}

.windows-98-theme .win-button:active {
  border: 1px inset #C0C0C0;
}

/* Windows XP Theme */
.windows-xp-theme {
  border: 1px solid #0A246A;
  background: #ECE9D8;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.windows-xp-theme .title-bar {
  background: linear-gradient(90deg, #0F4080 0%, #4080FF 50%, #0F4080 100%);
  color: white;
  font-family: 'Tahoma', sans-serif;
  font-size: 11px;
  height: 22px;
  border-radius: 8px 8px 0 0;
}

.windows-xp-theme .win-button {
  background: linear-gradient(145deg, #E1E1E1 0%, #C0C0C0 100%);
  border: 1px solid #8E8E8E;
  width: 18px;
  height: 16px;
  font-size: 9px;
  color: black;
  border-radius: 2px;
  margin: 0 1px;
}

.windows-xp-theme .win-button:hover {
  background: linear-gradient(145deg, #F0F0F0 0%, #D0D0D0 100%);
}

.windows-xp-theme .win-button:active {
  background: linear-gradient(145deg, #C0C0C0 0%, #A0A0A0 100%);
}

/* Windows Vista Theme */
.windows-vista-theme {
  border: 1px solid rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.windows-vista-theme .title-bar {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
  color: black;
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  height: 30px;
  border-radius: 8px 8px 0 0;
  backdrop-filter: blur(5px);
}

.windows-vista-theme .win-button {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 1px solid rgba(0, 0, 0, 0.2);
  width: 22px;
  height: 18px;
  font-size: 10px;
  color: black;
  border-radius: 3px;
  backdrop-filter: blur(5px);
  margin: 0 1px;
}

.windows-vista-theme .win-button:hover {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
}

.windows-vista-theme .win-button:active {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
}

/* Windows 7 Theme */
.windows-7-theme {
  border: 1px solid rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
}

.windows-7-theme .title-bar {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  color: black;
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  height: 28px;
  border-radius: 6px 6px 0 0;
  backdrop-filter: blur(5px);
}

.windows-7-theme .win-button {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 1px solid rgba(0, 0, 0, 0.15);
  width: 22px;
  height: 18px;
  font-size: 10px;
  color: black;
  border-radius: 3px;
  backdrop-filter: blur(3px);
  margin: 0 1px;
}

.windows-7-theme .win-button:hover {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%);
}

.windows-7-theme .win-button:active {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
}

/* Windows 8 Theme */
.windows-8-theme {
  border: none;
  background: #FFFFFF;
  border-radius: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.windows-8-theme .title-bar {
  background: #1BA1E2;
  color: white;
  font-family: 'Segoe UI', sans-serif;
  font-size: 14px;
  height: 32px;
  font-weight: 300;
}

.windows-8-theme .win-button {
  background: transparent;
  border: none;
  width: 32px;
  height: 28px;
  font-size: 11px;
  color: white;
  font-weight: 300;
  margin: 0;
}

.windows-8-theme .win-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.windows-8-theme .win-button:active {
  background: rgba(255, 255, 255, 0.3);
}

/* Windows 10 Theme */
.windows-10-theme {
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.windows-10-theme .title-bar {
  background: #F3F3F3;
  color: #333333;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  height: 32px;
  border-bottom: 1px solid #E0E0E0;
}

.windows-10-theme .win-button {
  background: transparent;
  border: none;
  width: 44px;
  height: 28px;
  font-size: 11px;
  color: #333333;
  margin: 0;
}

.windows-10-theme .win-button:hover {
  background: #E5E5E5;
}

.windows-10-theme .win-button:active {
  background: #CCCCCC;
}

.windows-10-theme .close-btn:hover {
  background: #E81123;
  color: white;
}

.windows-10-theme .close-btn:active {
  background: #C50E1F;
  color: white;
}

/* Windows 11 Theme */
.windows-11-theme {
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.windows-11-theme .title-bar {
  background: #F9F9F9;
  color: #333333;
  font-family: 'Segoe UI Variable', 'Segoe UI', sans-serif;
  font-size: 13px;
  height: 32px;
  border-bottom: 1px solid #E5E5E5;
  border-radius: 8px 8px 0 0;
}

.windows-11-theme .win-button {
  background: transparent;
  border: none;
  width: 46px;
  height: 32px;
  font-size: 12px;
  color: #333333;
  border-radius: 4px;
  margin: 0;
}

.windows-11-theme .win-button:hover {
  background: #F0F0F0;
}

.windows-11-theme .win-button:active {
  background: #E0E0E0;
}

.windows-11-theme .close-btn:hover {
  background: #C42B1C;
  color: white;
}

.windows-11-theme .close-btn:active {
  background: #A23517;
  color: white;
}

/* General Windows button styles - enhanced for better clickability */
.win-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
  min-width: 20px;
  min-height: 20px;
  position: relative;
  z-index: 20;
  border: none;
  font-family: inherit;
}

.win-button:active {
  transform: scale(0.95);
}

/* Enhanced title bar buttons container */
.title-bar-buttons {
  display: flex;
  align-items: center;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 15;
  gap: 1px;
}

/* All Windows buttons enhanced positioning */
.windows-buttons {
  position: absolute !important;
  right: 0 !important;
  top: 0 !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  z-index: 20 !important;
}

/* Theme-specific button container heights */
.windows-98-theme .windows-buttons {
  height: 18px !important;
}

.windows-xp-theme .windows-buttons {
  height: 22px !important;
}

.windows-vista-theme .windows-buttons {
  height: 30px !important;
}

.windows-7-theme .windows-buttons {
  height: 28px !important;
}

.windows-8-theme .windows-buttons {
  height: 32px !important;
}

.windows-10-theme .windows-buttons {
  height: 32px !important;
}

.windows-11-theme .windows-buttons {
  height: 32px !important;
}

/* Windows Content Styling */
.windows-98-content {
  padding: 8px;
  background: #C0C0C0;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  color: black;
}

.windows-xp-content {
  padding: 12px;
  background: #ECE9D8;
  font-family: 'Tahoma', sans-serif;
  font-size: 11px;
  color: #333;
}

.windows-vista-content {
  padding: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(5px);
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  color: #333;
}

.windows-7-content {
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(3px);
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  color: #333;
}

.windows-8-content {
  padding: 20px;
  background: #FFFFFF;
  font-family: 'Segoe UI', sans-serif;
  font-size: 14px;
  color: #333;
  font-weight: 300;
}

.windows-10-content {
  padding: 16px;
  background: #FFFFFF;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #333;
}

.windows-11-content {
  padding: 16px;
  background: #FFFFFF;
  font-family: 'Segoe UI Variable', 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #333;
}

.ios-content {
  padding: 16px;
  background: #ffffff;
}

/* Windows 11 specific button styling (inherits positioning from .windows-buttons) */
.windows-11-buttons {
  height: 32px !important;
}

.windows-11-buttons .win-button {
  width: 46px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  border: none !important;
  font-size: 10px !important;
  cursor: pointer !important;
  transition: background-color 0.1s ease !important;
}

.windows-11-buttons .win-button:hover {
  background: rgba(0, 0, 0, 0.1) !important;
}

.windows-11-buttons .close-btn:hover {
  background: #e81123 !important;
  color: white !important;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  z-index: 10;
  background: transparent;
}

.resize-handle:hover {
  background: rgba(0, 123, 255, 0.3);
}

/* Draggable window specific styles */
.draggable-window {
  margin: 0 !important;
}

/* macOS theme styles */
.macos-theme .title-bar {
  background: linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%);
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
  height: 28px;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #c0c0c0;
}

.macos-theme .title-bar-buttons {
  left: 8px !important;
  right: auto !important;
  gap: 8px;
}

.macos-theme .close,
.macos-theme .minimize,
.macos-theme .maximize {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.macos-theme .close {
  background: #ff5f57;
}

.macos-theme .minimize {
  background: #ffbd2e;
}

.macos-theme .maximize {
  background: #28ca42;
}

.macos-theme .close:hover {
  background: #ff4136;
}

.macos-theme .minimize:hover {
  background: #ffaa00;
}

.macos-theme .maximize:hover {
  background: #2ecc40;
}

/* Linux theme styles */
.linux-theme .title-bar {
  background: linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 100%);
  color: #333;
  font-family: 'Ubuntu', sans-serif;
  font-size: 13px;
  height: 32px;
  border-bottom: 1px solid #d0d0d0;
}

.linux-theme .title-bar-buttons {
  height: 32px !important;
}

.linux-theme .win-button {
  background: transparent;
  border: none;
  width: 32px;
  height: 28px;
  font-size: 12px;
  color: #333;
  margin: 0;
}

.linux-theme .win-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.linux-theme .close-btn:hover {
  background: #e74c3c;
  color: white;
}

.resize-n, .resize-s {
  left: 0;
  right: 0;
  height: 4px;
}

.resize-n {
  top: -2px;
  cursor: n-resize;
}

.resize-s {
  bottom: -2px;
  cursor: s-resize;
}

.resize-e, .resize-w {
  top: 0;
  bottom: 0;
  width: 4px;
}

.resize-e {
  right: -2px;
  cursor: e-resize;
}

.resize-w {
  left: -2px;
  cursor: w-resize;
}

.resize-ne, .resize-nw, .resize-se, .resize-sw {
  width: 8px;
  height: 8px;
}

.resize-ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.resize-nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.resize-se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.resize-sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}
</style>

