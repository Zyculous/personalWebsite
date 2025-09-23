<template>
  <div class="desktop-container" :class="`${osType}-desktop`">
    <!-- Desktop Background -->
    <div 
      class="desktop-background"
      :style="{ background: desktopConfig.wallpaper }"
    >
      <!-- Desktop Icons -->
      <div class="desktop-icons">
        <!-- Project Icons -->
        <DesktopIcon
          v-for="(project, index) in projects"
          :key="'project-' + project.name"
          :icon="getFileIcon('project', osType)"
          :label="project.name + desktopConfig.fileExtensions.project"
          :position="getIconPosition(index)"
          @double-click="openProject(project)"
        />
        
        <!-- About.txt Icon -->
        <DesktopIcon
          :icon="getFileIcon('text', osType)"
          :label="'About' + desktopConfig.fileExtensions.text"
          :position="getIconPosition(projects.length)"
          @double-click="openAbout"
        />
      </div>
      
      <!-- Opened Windows -->
      <div class="windows-container">
        <ProjectWindow
          v-for="project in activeProjects"
          :key="'window-' + project.name"
          :project="project"
          :theme="osType"
          :draggable="true"
          @close="closeProject(project)"
          class="desktop-window"
        />
        
        <TextViewer
          v-if="showAbout"
          :theme="osType"
          :content="aboutContent"
          title="About.txt"
          @close="closeAbout"
          class="desktop-window"
        />
      </div>
    </div>
    
    <!-- Taskbar/Dock -->
    <Taskbar
      v-if="desktopConfig.taskbarPosition !== 'none'"
      :os-type="osType"
      :position="desktopConfig.taskbarPosition"
      :height="desktopConfig.taskbarHeight"
      :color="desktopConfig.taskbarColor"
      :active-windows="[...activeProjects.map(p => p.name), ...(showAbout ? ['About.txt'] : [])]"
      @toggle-theme="$emit('toggle-theme')"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getDesktopConfig, getFileIcon, getDesktopGridPosition } from '../utils/osDetection.js';
import DesktopIcon from './DesktopIcon.vue';
import ProjectWindow from './ProjectWindow.vue';
import TextViewer from './TextViewer.vue';
import Taskbar from './Taskbar.vue';

const props = defineProps({
  projects: Array,
  osType: String
});

const emit = defineEmits(['toggle-theme']);

const activeProjects = ref([]);
const showAbout = ref(false);
const desktopSize = ref({ width: window.innerWidth, height: window.innerHeight });

const desktopConfig = computed(() => getDesktopConfig(props.osType));

const aboutContent = `About Me

Skills:
• HTML, CSS, JavaScript
• Vue.js & React
• Node.js
• Python
• Automation Anywhere 360 Certified
• C & C++
• Amazon Systems
• Debian and Ubuntu
• Database Management (SQL, MongoDB)

Contact & Links:
Email: zi@zanderin.space
LinkedIn: https://www.linkedin.com/in/zander-inderstrodt-60431b313
Resume: https://docs.google.com/document/d/1Dl0WqHU_zk-pOHw9GP1-dsylwo1TuEjyh9y1Wc7O2B4/edit?usp=sharing`;

const getIconPosition = (index) => {
  return getDesktopGridPosition(index, desktopSize.value.width, desktopSize.value.height);
};

const openProject = (project) => {
  console.log('Opening project:', project.name);
  if (!activeProjects.value.find(p => p.name === project.name)) {
    activeProjects.value.push(project);
  }
};

const closeProject = (project) => {
  activeProjects.value = activeProjects.value.filter(p => p.name !== project.name);
};

const openAbout = () => {
  console.log('Opening About.txt');
  showAbout.value = true;
};

const closeAbout = () => {
  showAbout.value = false;
};

// Handle window resize
const updateDesktopSize = () => {
  desktopSize.value = { width: window.innerWidth, height: window.innerHeight };
};

onMounted(() => {
  console.log('DesktopView mounted');
  console.log('Projects:', props.projects);
  console.log('OS Type:', props.osType);
  window.addEventListener('resize', updateDesktopSize);
});
</script>

<style scoped>
.desktop-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
}

.desktop-background {
  width: 100%;
  height: 100%;
  position: relative;
}

.desktop-icons {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: auto;
}

.windows-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.desktop-window {
  position: absolute;
  top: 10%;
  left: 10%;
  pointer-events: auto;
}

/* OS-specific styling */
.windows-desktop {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.macos-desktop {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.ios-desktop {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.linux-desktop {
  font-family: 'Ubuntu', 'Liberation Sans', sans-serif;
}
</style>