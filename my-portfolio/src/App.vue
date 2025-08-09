<script setup>
import { ref, onMounted } from 'vue';
import { animate } from 'animejs';
import WelcomeScreen from './components/WelcomeScreen.vue';
import Sidebar from './components/Sidebar.vue';
import ProjectWindow from './components/ProjectWindow.vue';
import AboutPage from './components/AboutPage.vue';
import ThemeSwitcher from './components/ThemeSwitcher.vue';

const projects = ref([]);
const activeProjects = ref([]);
const currentTheme = ref('windows'); // Default theme
const showThemeSwitcher = ref(false);

onMounted(async () => {
  // Detect OS
  const userAgent = window.navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    currentTheme.value = 'ios';
  } else if (userAgent.indexOf("Mac") !== -1) {
    currentTheme.value = 'macos';
  } else if (userAgent.indexOf("Win") !== -1) {
    currentTheme.value = 'windows';
  }

  // Fetch project data
  try {
    const response = await fetch('/projects.json');
    projects.value = await response.json();
  } catch (error) {
    console.error("Failed to load projects:", error);
  }
});

const showProject = (project) => {
  if (!activeProjects.value.find(p => p.name === project.name)) {
    activeProjects.value.unshift(project);
  }
};

const hideProject = (project) => {
  activeProjects.value = activeProjects.value.filter(p => p.name !== project.name);
  //Get the DIV element from the page usign the key contained in project.name and remove it from the DOM
  const projectDiv = document.querySelector(`.project-window[data-name="${project.name}"]`);
  if (projectDiv) {
    projectDiv.remove();
  }
};

const toggleThemeSwitcher = () => {
  showThemeSwitcher.value = !showThemeSwitcher.value;
};

const setTheme = (theme) => {
  currentTheme.value = theme;
};

// --- Transition Hooks ---
const onBeforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(100px) scale(0.9)';
};

const onEnter = (el, done) => {
  animate(
    el,
    {
      opacity: [0, 1],
      translateY: [100, 0],
      scale: [0.9, 1]
    },
    {
      duration: 800,
      easing: 'easeOutElastic(1, .8)',
      complete: done
    }
  );
};

const onLeave = (el, done) => {
  animate(
    el,
    {
      opacity: [1, 0],
      translateY: [0, -50],
      scale: [1, 0.95]
    },
    {
      duration: 400,
      easing: 'easeInQuad',
      complete: done
    }
  );
};
</script>

<template>
  <div class="relative min-h-screen">
    <WelcomeScreen />

    <div class="container mx-auto px-4 py-16 mt-[50vh]">
      <div class="flex flex-col lg:flex-row gap-8">
        <Sidebar :projects="projects" @select-project="showProject" />

        <main class="flex-1">
          <TransitionGroup
            tag="div"
            class="relative"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @leave="onLeave"
          >
            <div
              v-for="(project, index) in activeProjects"
              :key="project.name"
              :style="{ zIndex: index }"
              class="project-window"
              :data-name="project.name"
            >
              <ProjectWindow :project="project" :theme="currentTheme" @close="hideProject(project)" />
            </div>
          </TransitionGroup>
        </main>
      </div>
    </div>
    
    <AboutPage />

    <div class="fixed bottom-4 right-4 font-vt323 text-7xl text-pink-400 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" @dblclick="toggleThemeSwitcher">
      Z
    </div>

    <ThemeSwitcher v-if="showThemeSwitcher" :current-theme="currentTheme" @set-theme="setTheme" />
  </div>
</template>
