<template>
  <div class="macos-menu-bar" :class="`${normalizedTheme}-menu-bar`">
    <!-- Left side - Apple menu and app menus -->
    <div class="menu-left">
      <div class="apple-menu">🍎</div>
      <div class="app-menu">Portfolio</div>
      <div class="menu-item">File</div>
      <div class="menu-item">Edit</div>
      <div class="menu-item">View</div>
      <div class="menu-item">Window</div>
      <div class="menu-item">Help</div>
    </div>
    
    <!-- Right side - System menu items -->
    <div class="menu-right">
      <div class="menu-item" @click="$emit('toggle-theme')">⚙️</div>
      <div class="menu-item">🔋</div>
      <div class="menu-item">📶</div>
      <div class="menu-item">🔊</div>
      <div class="menu-item">{{ currentTime }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  theme: String
});

defineEmits(['toggle-theme']);

// Normalize theme for CSS classes
const normalizedTheme = computed(() => {
  if (props.theme.startsWith('macos')) {
    return 'macos';
  }
  return props.theme;
});

const currentTime = ref('');

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

let timeInterval;

onMounted(() => {
  console.log('MacOSMenuBar mounted with theme:', props.theme);
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
.macos-menu-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: rgba(255, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 400;
  z-index: 9999;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: #000;
}

.menu-left,
.menu-right {
  display: flex;
  align-items: center;
  height: 100%;
}

.apple-menu {
  font-size: 14px;
  padding: 0 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
}

.app-menu {
  font-weight: 600;
  padding: 0 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
}

.menu-item {
  padding: 0 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  border-radius: 4px;
  margin: 0 2px;
  transition: background-color 0.1s ease;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

.menu-right {
  padding-right: 8px;
}

.menu-right .menu-item {
  font-size: 12px;
  min-width: 20px;
  justify-content: center;
}

/* Theme-specific styling */
.macos-menu-bar.macos-menu-bar {
  background: rgba(246, 246, 246, 0.8);
}

/* Dark mode themes */
.macos-leopard-menu-bar,
.macos-mojave-menu-bar,
.macos-ventura-menu-bar {
  background: rgba(40, 40, 40, 0.9);
  color: #fff;
}

.macos-leopard-menu-bar .menu-item:hover,
.macos-mojave-menu-bar .menu-item:hover,
.macos-ventura-menu-bar .menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Adjust desktop content for menu bar */
.macos-desktop {
  padding-top: 24px;
}
</style>