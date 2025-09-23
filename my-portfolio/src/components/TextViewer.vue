<template>
  <div 
    class="text-viewer"
    :class="`${theme}-text-viewer`"
    :style="windowStyle"
    ref="windowRef"
  >
    <!-- Window Header -->
    <div class="text-viewer-header" @mousedown="startDrag">
      <!-- Window Controls -->
      <div class="window-controls" :class="theme">
        <template v-if="theme === 'macos'">
          <div class="control-button close" @click="$emit('close')"></div>
          <div class="control-button minimize"></div>
          <div class="control-button maximize"></div>
        </template>
        <template v-else-if="theme === 'windows'">
          <div class="control-button minimize" @click="minimizeWindow">_</div>
          <div class="control-button maximize">☐</div>
          <div class="control-button close" @click="$emit('close')">✕</div>
        </template>
        <template v-else-if="theme === 'ios'">
          <div class="ios-nav">
            <div class="ios-spacer"></div>
            <h2 class="ios-title">{{ title }}</h2>
            <div class="ios-spacer"></div>
          </div>
        </template>
        <template v-else-if="theme === 'linux'">
          <div class="control-button minimize" @click="minimizeWindow">_</div>
          <div class="control-button maximize">☐</div>
          <div class="control-button close" @click="$emit('close')">✕</div>
        </template>
      </div>
      
      <!-- Title for non-iOS themes -->
      <div v-if="theme !== 'ios'" class="window-title">{{ title }}</div>
      
      <!-- Menu (for some OS themes) -->
      <div v-if="theme === 'windows'" class="window-menu">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Help</span>
      </div>
    </div>
    
    <!-- Content Area -->
    <div class="text-content" :class="theme">
      <pre>{{ content }}</pre>
    </div>
    
    <!-- Status Bar (Windows/Linux) -->
    <div v-if="theme === 'windows' || theme === 'linux'" class="status-bar">
      <span>{{ getLineCount() }} lines</span>
      <span>{{ getCharCount() }} characters</span>
    </div>
    
    <!-- iOS Home Indicator -->
    <div v-if="theme === 'ios'" class="ios-home-indicator-bar">
      <div class="ios-home-indicator"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useSwipeGesture } from '../composables/useSwipeGesture.js';

const props = defineProps({
  theme: String,
  content: String,
  title: String
});

const emit = defineEmits(['close', 'show-app-switcher', 'minimize']);

const windowRef = ref(null);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const windowPosition = ref({ x: 200, y: 100 });
const windowSize = ref({ width: 600, height: 400 });

// iOS Swipe Gesture - only from bottom area
const { swipeDirection, isSwipeDetected } = useSwipeGesture(windowRef, {
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
    return {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      zIndex: 100
    };
  }
  
  return {
    left: windowPosition.value.x + 'px',
    top: windowPosition.value.y + 'px',
    width: windowSize.value.width + 'px',
    height: windowSize.value.height + 'px'
  };
});

const getLineCount = () => {
  return props.content.split('\n').length;
};

const getCharCount = () => {
  return props.content.length;
};

// Drag functionality
const startDrag = (e) => {
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

// Window actions
const minimizeWindow = () => {
  emit('minimize');
};
</script>

<style scoped>
.text-viewer {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 100;
  min-width: 400px;
  min-height: 300px;
}

.text-viewer-header {
  display: flex;
  align-items: center;
  height: 40px;
  background: #f0f0f0;
  border-bottom: 1px solid #d0d0d0;
  cursor: move;
  user-select: none;
}

.window-controls {
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
}

.window-controls.macos .control-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
}

.window-controls.macos .close {
  background: #ff5f57;
}

.window-controls.macos .minimize {
  background: #ffbd2e;
}

.window-controls.macos .maximize {
  background: #28ca42;
}

.window-controls.windows .control-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  margin: 0 2px;
}

.window-controls.windows .control-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.window-controls.windows .close:hover {
  background: #e81123;
  color: white;
}

.ios-handle {
  width: 40px;
  height: 4px;
  background: #ccc;
  border-radius: 2px;
  margin: 0 auto;
}

.window-title {
  flex: 1;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
}

.window-menu {
  display: flex;
  gap: 12px;
  padding: 0 12px;
  font-size: 12px;
}

.window-menu span {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.window-menu span:hover {
  background: rgba(0, 0, 0, 0.1);
}

.text-content {
  height: calc(100% - 40px);
  overflow: auto;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  background: white;
}

.text-content.windows {
  font-family: 'Consolas', 'Courier New', monospace;
  background: white;
}

.text-content.macos {
  font-family: 'Menlo', 'Monaco', monospace;
  background: #fefefe;
}

.text-content.ios {
  font-family: 'San Francisco Mono', 'Monaco', monospace;
  background: #fafafa;
  padding: 20px;
}

.text-content.linux {
  font-family: 'Ubuntu Mono', 'Courier New', monospace;
  background: #ffffff;
}

.text-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.status-bar {
  height: 24px;
  background: #f0f0f0;
  border-top: 1px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 12px;
  color: #666;
}

/* iOS Home Indicator Bar */
.ios-home-indicator-bar {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 248, 248, 0.94);
  backdrop-filter: blur(20px);
}

.ios-home-indicator {
  width: 134px;
  height: 5px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

/* OS-specific styling */
.windows-text-viewer {
  border-radius: 0;
  border: 1px solid #0078d4;
}

.windows-text-viewer .text-viewer-header {
  background: #0078d4;
  color: white;
  height: 32px;
}

.macos-text-viewer {
  border-radius: 12px;
  backdrop-filter: blur(20px);
}

.macos-text-viewer .text-viewer-header {
  background: rgba(246, 246, 246, 0.8);
  backdrop-filter: blur(20px);
}

.ios-text-viewer {
  border-radius: 0;
  border: none;
  box-shadow: none;
  background: #f2f2f7;
}

.ios-text-viewer .text-viewer-header {
  background: rgba(248, 248, 248, 0.94);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 44px;
  justify-content: flex-start;
  padding: 0;
}

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

.ios-text-viewer .text-content {
  background: #ffffff;
  padding: 16px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  height: calc(100% - 44px - 40px); /* Account for header and home indicator */
}

.linux-text-viewer {
  border-radius: 6px;
  border: 1px solid #333;
}

.linux-text-viewer .text-viewer-header {
  background: #2d2d2d;
  color: white;
}
</style>