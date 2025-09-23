<template>
  <div class="app">
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

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>