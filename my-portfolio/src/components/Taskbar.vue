<template>
  <div 
    class="taskbar"
    :class="`${osType}-taskbar`"
    :style="taskbarStyle"
  >
    <!-- Windows Taskbar -->
    <div v-if="osType === 'windows'" class="windows-taskbar-content">
      <div class="start-button">
        <span>⊞</span>
        <span>Start</span>
      </div>
      
      <div class="taskbar-items">
        <div 
          v-for="window in activeWindows" 
          :key="window"
          class="taskbar-item"
          :class="{ 'minimized': isWindowMinimized(window) }"
          @click="handleWindowClick(window)"
        >
          {{ window }}
        </div>
      </div>
      
      <div class="system-tray">
        <div class="theme-toggle" @click="$emit('toggle-theme')" title="Change Theme">
          🎨
        </div>
        <div class="time">
          {{ currentTime }}
        </div>
      </div>
    </div>
    
    <!-- macOS Dock -->
    <div v-else-if="osType === 'macos'" class="macos-dock">
      <div class="dock-items">
        <div 
          v-for="window in activeWindows" 
          :key="window"
          class="dock-item"
          :title="window"
        >
          <div class="dock-icon">{{ getAppIcon(window) }}</div>
          <div class="dock-indicator"></div>
        </div>
        
        <div class="dock-divider"></div>
        
        <div class="dock-item theme-toggle" @click="$emit('toggle-theme')" title="Change Theme">
          <div class="dock-icon">🎨</div>
        </div>
      </div>
    </div>

    <!-- iOS Dock -->
    <div v-else-if="osType === 'ios'" class="ios-dock">
      <div class="dock-background">
        <div class="dock-items">
          <!-- Default iOS apps -->
          <div class="dock-item">
            <div class="dock-icon">📞</div>
          </div>
          <div class="dock-item">
            <div class="dock-icon">💬</div>
          </div>
          <div class="dock-item">
            <div class="dock-icon">📧</div>
          </div>
          <div class="dock-item theme-toggle" @click="$emit('toggle-theme')" title="Portfolio Settings">
            <div class="dock-icon">⚙️</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Linux Taskbar -->
    <div v-else-if="osType === 'linux'" class="linux-taskbar-content">
      <div class="activities-button">
        Activities
      </div>
      
      <div class="taskbar-items">
        <div 
          v-for="window in activeWindows" 
          :key="window"
          class="taskbar-item"
        >
          {{ window }}
        </div>
      </div>
      
      <div class="system-tray">
        <div class="theme-toggle" @click="$emit('toggle-theme')" title="Change Theme">
          🎨
        </div>
        <div class="time">
          {{ currentTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  osType: String,
  position: String,
  height: String,
  color: String,
  activeWindows: Array,
  minimizedWindows: {
    type: Set,
    default: () => new Set()
  }
});

const emit = defineEmits(['toggle-theme', 'restore-window']);

const currentTime = ref('');

// Helper methods
const isWindowMinimized = (windowName) => {
  const appId = windowName === 'About.txt' ? 'about-txt' : `project-${windowName}`;
  return props.minimizedWindows.has(appId);
};

const handleWindowClick = (windowName) => {
  const appId = windowName === 'About.txt' ? 'about-txt' : `project-${windowName}`;
  if (isWindowMinimized(windowName)) {
    emit('restore-window', appId);
  }
  // If not minimized, could add logic to bring to front or minimize
};

const taskbarStyle = computed(() => ({
  position: 'fixed',
  [props.position]: '0',
  left: '0',
  right: '0',
  height: props.height,
  background: props.color,
  zIndex: 1000
}));

const getAppIcon = (windowName) => {
  const icons = {
    'About.txt': '📄',
    'MS Paint Clone': '🎨',
    'Game Day Grill': '🍔',
    'Personal Website': '💻'
  };
  return icons[windowName] || '📱';
};

const updateTime = () => {
  const now = new Date();
  const timeOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: props.osType === 'windows'
  };
  currentTime.value = now.toLocaleTimeString([], timeOptions);
};

let timeInterval;

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
.taskbar {
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
}

/* Windows Taskbar */
.windows-taskbar-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  gap: 8px;
}

.start-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-size: 14px;
}

.start-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.taskbar-items {
  flex: 1;
  display: flex;
  gap: 4px;
}

.taskbar-item {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.taskbar-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.taskbar-item.minimized {
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  opacity: 0.7;
}

.taskbar-item.minimized:hover {
  background: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.system-tray {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 16px;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.time {
  color: white;
  font-size: 13px;
  min-width: 60px;
  text-align: center;
}

/* macOS Dock */
.macos-dock {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 8px;
}

.dock-items {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  padding: 8px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dock-item {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.dock-item:hover {
  transform: scale(1.2) translateY(-8px);
}

.dock-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.dock-indicator {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
}

.dock-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 8px;
}

/* Linux Taskbar */
.linux-taskbar-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  gap: 12px;
}

.activities-button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.activities-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* iOS Dock */
.ios-dock {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 100%;
  padding: 8px 16px 20px 16px;
}

.dock-background {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ios-dock .dock-items {
  display: flex;
  gap: 16px;
  background: none;
  padding: 0;
  border-radius: 0;
  border: none;
}

.ios-dock .dock-item {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.ios-dock .dock-item:hover {
  transform: scale(1.1) translateY(-4px);
}

.ios-dock .dock-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* OS-specific styling */
.windows-taskbar {
  background: rgba(0, 0, 0, 0.8) !important;
}

.macos-taskbar {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px);
}

.linux-taskbar {
  background: rgba(44, 62, 80, 0.9) !important;
}
</style>