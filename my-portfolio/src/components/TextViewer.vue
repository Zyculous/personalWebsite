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
          <div class="control-button minimize">_</div>
          <div class="control-button maximize">☐</div>
          <div class="control-button close" @click="$emit('close')">✕</div>
        </template>
        <template v-else-if="theme === 'ios'">
          <div class="ios-handle"></div>
        </template>
      </div>
      
      <!-- Title -->
      <div class="window-title">{{ title }}</div>
      
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  theme: String,
  content: String,
  title: String
});

const emit = defineEmits(['close']);

const windowRef = ref(null);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const windowPosition = ref({ x: 200, y: 100 });
const windowSize = ref({ width: 600, height: 400 });

const windowStyle = computed(() => ({
  left: windowPosition.value.x + 'px',
  top: windowPosition.value.y + 'px',
  width: windowSize.value.width + 'px',
  height: windowSize.value.height + 'px'
}));

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
  border-radius: 20px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.ios-text-viewer .text-viewer-header {
  background: #f8f8f8;
  height: 36px;
  justify-content: center;
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