<template>
  <div class="desktop-container" :class="`${osType}-desktop`">
    <!-- iOS Status Bar -->
    <div v-if="osType === 'ios'" class="ios-status-bar">
      <div class="status-left">
        <span class="time">{{ currentTime }}</span>
      </div>
      <div class="status-center">
        <div class="notch"></div>
      </div>
      <div class="status-right">
        <span class="battery">100%</span>
        <span class="signal">📶</span>
        <span class="wifi">📶</span>
      </div>
    </div>

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
          :os-type="osType"
          @double-click="openProject(project)"
        />
        
        <!-- About.txt Icon -->
        <DesktopIcon
          :icon="getFileIcon('text', osType)"
          :label="'About' + desktopConfig.fileExtensions.text"
          :position="getIconPosition(projects.length)"
          :os-type="osType"
          @double-click="openAbout"
        />
        
        <!-- Settings/Theme Switcher Icon (iOS only) -->
        <DesktopIcon
          v-if="osType === 'ios'"
          :icon="'⚙️'"
          :label="'Settings'"
          :position="getIconPosition(projects.length + 1)"
          :os-type="osType"
          @double-click="$emit('toggle-theme')"
        />
      </div>
      
      <!-- Opened Windows -->
      <div class="windows-container">
        <ProjectWindow
          v-for="project in activeProjects"
          :key="'window-' + project.name"
          :project="project"
          :theme="osType"
          :draggable="osType !== 'ios'"
          @close="closeProject(project)"
          @show-app-switcher="showAppSwitcher"
          class="desktop-window"
        />
        
        <TextViewer
          v-if="showAbout"
          :theme="osType"
          :content="aboutContent"
          title="About.txt"
          @close="closeAbout"
          @show-app-switcher="showAppSwitcher"
          class="desktop-window"
        />
      </div>
      
      <!-- App Switcher -->
      <AppSwitcher
        :is-visible="isAppSwitcherVisible"
        :open-apps="getOpenApps()"
        @close="hideAppSwitcher"
        @switch-to-app="switchToApp"
        @close-app="closeAppFromSwitcher"
        @go-to-home="goToHome"
      />
    </div>
    
    <!-- Taskbar/Dock (not for iOS) -->
    <Taskbar
      v-if="desktopConfig.taskbarPosition !== 'none' && osType !== 'ios'"
      :os-type="osType"
      :position="desktopConfig.taskbarPosition"
      :height="desktopConfig.taskbarHeight"
      :color="desktopConfig.taskbarColor"
      :active-windows="[...activeProjects.map(p => p.name), ...(showAbout ? ['About.txt'] : [])]"
      @toggle-theme="$emit('toggle-theme')"
    />

    <!-- iOS Home Indicator -->
    <div v-if="osType === 'ios'" class="ios-home-indicator"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getDesktopConfig, getFileIcon, getDesktopGridPosition } from '../utils/osDetection.js';
import DesktopIcon from './DesktopIcon.vue';
import ProjectWindow from './ProjectWindow.vue';
import TextViewer from './TextViewer.vue';
import Taskbar from './Taskbar.vue';
import AppSwitcher from './AppSwitcher.vue';

const props = defineProps({
  projects: Array,
  osType: String
});

const emit = defineEmits(['toggle-theme']);

const activeProjects = ref([]);
const showAbout = ref(false);
const isAppSwitcherVisible = ref(false);
const desktopSize = ref({ width: window.innerWidth, height: window.innerHeight });
const currentTime = ref('');

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
  const position = getDesktopGridPosition(index, desktopSize.value.width, desktopSize.value.height, props.osType);
  console.log(`Icon ${index} position:`, position, 'OS:', props.osType, 'Container size:', desktopSize.value);
  return position;
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

// App Switcher Methods
const showAppSwitcher = () => {
  if (props.osType === 'ios') {
    isAppSwitcherVisible.value = true;
  }
};

const hideAppSwitcher = () => {
  isAppSwitcherVisible.value = false;
};

const getOpenApps = () => {
  const apps = [];
  
  // Add active projects
  activeProjects.value.forEach(project => {
    apps.push({
      id: `project-${project.name}`,
      name: project.name,
      type: 'project',
      icon: getFileIcon('project', props.osType),
      data: project
    });
  });
  
  // Add About.txt if open
  if (showAbout.value) {
    apps.push({
      id: 'about-txt',
      name: 'About.txt',
      type: 'text',
      icon: getFileIcon('text', props.osType),
      data: null
    });
  }
  
  return apps;
};

const switchToApp = (app) => {
  // Apps stay open, just hide the switcher
  // The app is already visible, so just bring it to front
  console.log('Switching to app:', app.name);
};

const closeAppFromSwitcher = (app) => {
  if (app.type === 'project') {
    const project = activeProjects.value.find(p => p.name === app.name);
    if (project) {
      closeProject(project);
    }
  } else if (app.type === 'text' && app.name === 'About.txt') {
    closeAbout();
  }
};

const goToHome = () => {
  // Close all apps and return to home screen
  activeProjects.value = [];
  showAbout.value = false;
};

// Handle window resize
const updateDesktopSize = () => {
  desktopSize.value = { width: window.innerWidth, height: window.innerHeight };
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

onMounted(() => {
  console.log('DesktopView mounted');
  console.log('Projects:', props.projects);
  console.log('OS Type:', props.osType);
  window.addEventListener('resize', updateDesktopSize);
  
  if (props.osType === 'ios') {
    updateTime();
    setInterval(updateTime, 1000);
  }
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

.ios-desktop .desktop-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
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
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  background: #000;
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.ios-desktop .desktop-background {
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.ios-desktop .desktop-icons {
  padding-top: 44px; /* Account for status bar */
  padding-bottom: 20px; /* Small bottom padding instead of dock space */
}

.linux-desktop {
  font-family: 'Ubuntu', 'Liberation Sans', sans-serif;
}

/* iOS Status Bar */
.ios-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.status-left {
  flex: 1;
}

.status-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.notch {
  width: 120px;
  height: 20px;
  background: black;
  border-radius: 0 0 12px 12px;
}

.status-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

/* iOS Home Indicator */
.ios-home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 3px;
  z-index: 1000;
}
</style>