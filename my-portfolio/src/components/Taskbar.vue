<template>
  <div 
    class="taskbar"
    :class="`${osType}-taskbar`"
    :style="taskbarStyle"
  >
    <!-- Windows Taskbar -->
    <div v-if="osType === 'windows' || osType.startsWith('windows')" class="windows-taskbar-content">
      <!-- Windows 11 specific Start button -->
      <div v-if="osType === 'windows-11'" class="windows-11-start-section">
        <div class="start-button windows-11-start">
          <span class="windows-logo">⊞</span>
        </div>
        <div class="search-button">
          <span class="search-icon">🔍</span>
        </div>
        <div class="task-view-button">
          <span class="task-view-icon">⧉</span>
        </div>
        <div class="widgets-button">
          <span class="widgets-icon">☀</span>
        </div>
      </div>
      
      <!-- Other Windows versions Start button -->
      <div v-else class="start-button">
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
      
      <div class="system-tray" :class="{ 'windows-11-system-tray': osType === 'windows-11' }">
        <div v-if="osType === 'windows-11'" class="windows-11-system-icons">
          <div class="system-icon">🔊</div>
          <div class="system-icon">📶</div>
          <div class="system-icon">🔋</div>
        </div>
        <div class="theme-toggle" @click="$emit('toggle-theme')" title="Change Theme">
          🎨
        </div>
        <div class="time" :class="{ 'windows-11-time': osType === 'windows-11' }">
          <div v-if="osType === 'windows-11'" class="time-date">
            <div class="time-display">{{ currentTime }}</div>
            <div class="date-display">{{ currentDate }}</div>
          </div>
          <div v-else>{{ currentTime }}</div>
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
const currentDate = ref('');

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
    hour12: props.osType === 'windows' || props.osType.startsWith('windows')
  };
  currentTime.value = now.toLocaleTimeString([], timeOptions);
  
  // Format date for Windows 11
  if (props.osType === 'windows-11') {
    const dateOptions = { 
      month: 'numeric', 
      day: 'numeric',
      year: 'numeric'
    };
    currentDate.value = now.toLocaleDateString([], dateOptions);
  }
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

/* Windows 11 specific styling */
.windows-11-start-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.windows-11-start {
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 6px !important;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  transition: all 0.2s ease;
}

.windows-11-start:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

.windows-logo {
  font-size: 18px;
  color: white;
}

.search-button, .task-view-button, .widgets-button {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-button:hover, .task-view-button:hover, .widgets-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.search-icon, .task-view-icon, .widgets-icon {
  font-size: 16px;
  color: white;
}

.windows-11-system-tray {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 4px 8px;
  margin-left: 8px;
}

.windows-11-system-icons {
  display: flex;
  gap: 8px;
  margin-right: 12px;
}

.system-icon {
  font-size: 14px;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.system-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.windows-11-time {
  text-align: right;
  min-width: 80px;
}

.time-display {
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
}

.date-display {
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
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

.windows-11-desktop .taskbar {
  background: rgba(32, 32, 32, 0.7) !important;
  backdrop-filter: blur(30px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.macos-taskbar {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px);
}

.linux-taskbar {
  background: rgba(44, 62, 80, 0.9) !important;
}
</style>