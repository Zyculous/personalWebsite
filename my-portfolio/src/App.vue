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
const currentTheme = ref('windows-11'); // Default theme
const showThemeSwitcher = ref(false);

onMounted(async () => {
  // Detect OS automatically
  const detectedOS = detectOS();
  console.log('Detected OS:', detectedOS);
  currentTheme.value = detectedOS;
  console.log('Current theme set to:', currentTheme.value);

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
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
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
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  
  .ios-mode > * {
    max-width: 375px;
    width: 375px;
    height: 812px; /* iPhone X/11/12/13 height */
    border-radius: 40px;
    border: 8px solid #1a1a1a;
    position: relative;
    margin: 0 auto;
    box-shadow: 
      0 0 0 2px #333,
      0 0 30px rgba(0, 0, 0, 0.8),
      inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    background: #000;
    overflow: hidden;
  }
  
  /* Power button */
  .ios-mode > *::after {
    content: '';
    position: absolute;
    top: 200px;
    right: -12px;
    transform: translateY(-50%);
    width: 4px;
    height: 60px;
    background: #333;
    border-radius: 0 2px 2px 0;
    z-index: 1002;
  }
  
  /* Volume buttons */
  .ios-mode > *::before {
    content: '';
    position: absolute;
    top: 150px;
    left: -12px;
    width: 4px;
    height: 30px;
    background: #333;
    border-radius: 2px 0 0 2px;
    z-index: 1002;
    box-shadow: 0 50px 0 #333;
  }
}

/* Ensure mobile devices get full screen experience */
@media (max-width: 767px) {
  .ios-mode {
    background: #000;
    padding: 0;
    align-items: flex-start;
  }
  
  .ios-mode > * {
    max-width: 100%;
    width: 100%;
    height: 100vh;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
}
</style>