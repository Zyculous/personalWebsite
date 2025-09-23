<template>
  <div class="app" :class="{ 'ios-mode': currentTheme === 'ios' }">
    <DesktopView 
      :projects="projects" 
      :os-type="currentTheme"
      @toggle-theme="toggleThemeSwitcher"
    />

    <!-- Theme Switcher -->
    <ThemeSwitcher 
      v-if="showThemeSwitcher" 
      :current-theme="currentTheme" 
      @set-theme="setTheme" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { detectOS } from './utils/osDetection.js';
import DesktopView from './components/DesktopView.vue';
import ThemeSwitcher from './components/ThemeSwitcher.vue';

const projects = ref([]);
const currentTheme = ref('windows'); // Default theme
const showThemeSwitcher = ref(false);

onMounted(async () => {
  // Detect OS automatically
  currentTheme.value = detectOS();

  // Fetch project data
  try {
    const response = await fetch('/projects.json');
    projects.value = await response.json();
  } catch (error) {
    console.error("Failed to load projects:", error);
  }
});

const toggleThemeSwitcher = () => {
  showThemeSwitcher.value = !showThemeSwitcher.value;
};

const setTheme = (theme) => {
  currentTheme.value = theme;
  showThemeSwitcher.value = false;
};
</script>

<style>
.app {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.app.ios-mode {
  background: #000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 20px 0;
}

.app.ios-mode > * {
  max-width: 375px;
  width: 100%;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  background: #000;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Add phone-like styling when iOS theme is active */
@media (min-width: 768px) {
  .ios-mode {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px;
  }
  
  .ios-mode > * {
    max-width: 375px;
    height: 812px; /* iPhone X/11/12/13 height */
    border-radius: 40px;
    border: 8px solid #1a1a1a;
    position: relative;
    margin: 0 auto;
  }
  
  .ios-mode > *::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 30px;
    background: #1a1a1a;
    border-radius: 0 0 20px 20px;
    z-index: 1001;
  }
}
</style>