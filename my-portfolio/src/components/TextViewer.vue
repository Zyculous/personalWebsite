<template>
  <div
    class="text-viewer"
    :class="`${normalizedTheme}-text-viewer`"
    :style="windowStyle"
    ref="windowRef"
  >
    <!-- Window Header -->
    <div class="text-viewer-header" :class="headerClass" @mousedown="startDrag">
      <!-- .window-title {
  flex: 1;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  margin: 0 12px; /* Reduced margins since menu is in normal flow */
}or some OS themes) -->
      <div v-if="theme.startsWith('windows')" class="window-menu">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Help</span>
      </div>
      
      <!-- Title for non-iOS themes -->
      <div v-if="theme !== 'ios'" class="window-title">{{ title }}</div>
      
      <!-- Window Controls -->
      <div class="window-controls" :class="normalizedTheme">
        <template v-if="theme === 'macos'">
          <div class="control-button close" @click="$emit('close')"></div>
          <div class="control-button minimize"></div>
          <div class="control-button maximize"></div>
        </template>
        <template v-else-if="theme.startsWith('windows')">
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
    </div>
    
    <!-- Content Area -->
    <div class="text-content" :class="normalizedTheme">
      <pre>{{ content }}</pre>
    </div>
    
    <!-- Status Bar (Windows/Linux) -->
    <div v-if="theme.startsWith('windows') || theme === 'linux'" class="status-bar">
      <span>{{ getLineCount() }} lines</span>
      <span>{{ getCharCount() }} characters</span>
    </div>
    
    <!-- iOS Home Indicator -->
    <div v-if="theme === 'ios'" class="ios-home-indicator-bar">
      <div class="ios-home-indicator"></div>
    </div>
    
    <!-- Resize handles for draggable windows (not iOS) -->
    <template v-if="theme !== 'ios'">
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

<script setup>
import { ref, computed, watch } from 'vue';
import { useSwipeGesture } from '../composables/useSwipeGesture.js';

const props = defineProps({
  theme: String,
  content: String,
  title: String
});

const emit = defineEmits(['close', 'show-app-switcher', 'minimize']);

// Normalize theme for CSS classes
const normalizedTheme = computed(() => {
  if (props.theme.startsWith('windows')) {
    return 'windows';
  }
  return props.theme;
});

const windowRef = ref(null);
const isDragging = ref(false);
const isResizing = ref(false);
const resizeDirection = ref('');
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
  isResizing.value = false;
  resizeDirection.value = '';
  document.body.style.cursor = 'default';
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopDrag);
};

// Resize functionality
const startResize = (direction, event) => {
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
  padding: 0;
  gap: 0;
  flex: 0 0 auto;
  margin-left: auto;
  margin-right: 8px;
}

.window-controls.macos {
  position: absolute;
  left: 12px;
  right: auto;
  margin-left: 0;
  margin-right: 0;
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
  width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  margin: 0;
  background: transparent;
  border: none;
  transition: background-color 0.1s ease;
  user-select: none;
  z-index: 25;
}

.window-controls.windows .control-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.window-controls.windows .control-button:active {
  background: rgba(0, 0, 0, 0.2);
}

.window-controls.windows .close:hover {
  background: #e81123;
  color: white;
}

.window-controls.windows .close:active {
  background: #c50e1f;
  color: white;
}

.window-controls.linux .control-button {
  width: 32px;
  height: 24px;
  margin: 0 2px;
  background: #404040;
  color: white;
  border: 1px solid #555;
  border-radius: 3px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.window-controls.linux .control-button:hover {
  background: #505050;
}

.ios-handle {
  width: 40px;
  height: 4px;
  background: #ccc;
  border-radius: 2px;
  margin: 0 auto;
}

.window-title {
  flex: 0 1 auto;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  margin: 0 12px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.window-menu {
  display: flex;
  gap: 12px;
  padding: 0 12px;
  font-size: 12px;
  align-items: center;
  flex: 0 0 auto;
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
  color: black;
}

.text-content.windows {
  font-family: 'Consolas', 'Courier New', monospace;
  background: white;
  color: black;
}

.text-content.macos {
  font-family: 'Menlo', 'Monaco', monospace;
  background: #fefefe;
  color: black;
}

.text-content.ios {
  font-family: 'San Francisco Mono', 'Monaco', monospace;
  background: #fafafa;
  padding: 20px;
  color: black;
}

.text-content.linux {
  font-family: 'Ubuntu Mono', 'Courier New', monospace;
  background: #ffffff;
  color: black;
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

/* Windows theme-specific button adjustments for TextViewer */
.windows-text-viewer .window-controls.windows .control-button {
  width: 40px;
  height: 32px;
  font-size: 11px;
  margin: 0;
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

/* Resize handles */
.resize-handle {
  position: absolute;
  background: transparent;
  z-index: 200;
}

.resize-n, .resize-s {
  height: 4px;
  left: 8px;
  right: 8px;
  cursor: n-resize;
}

.resize-n {
  top: 0;
}

.resize-s {
  bottom: 0;
}

.resize-e, .resize-w {
  width: 4px;
  top: 8px;
  bottom: 8px;
  cursor: e-resize;
}

.resize-e {
  right: 0;
}

.resize-w {
  left: 0;
}

.resize-ne, .resize-nw, .resize-se, .resize-sw {
  width: 8px;
  height: 8px;
}

.resize-ne {
  top: 0;
  right: 0;
  cursor: ne-resize;
}

.resize-nw {
  top: 0;
  left: 0;
  cursor: nw-resize;
}

.resize-se {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}

.resize-sw {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
}
</style>