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
          v-show="!minimizedApps.has(`project-${project.name}`)"
          :project="project"
          :theme="osType"
          :draggable="osType !== 'ios'"
          @close="closeProject(project)"
          @minimize="minimizeProject(project)"
          @show-app-switcher="showAppSwitcher"
          class="desktop-window"
        />
        
        <TextViewer
          v-if="showAbout"
          v-show="!minimizedApps.has('about-txt')"
          :theme="osType"
          :content="aboutContent"
          title="About.txt"
          @close="closeAbout"
          @minimize="minimizeAbout"
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
      :minimized-windows="minimizedApps"
      @toggle-theme="$emit('toggle-theme')"
      @restore-window="restoreApp"
    />

    <!-- iOS Home Indicator -->
    <div v-if="osType === 'ios'" class="ios-home-indicator"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

// Session tracking for app switcher
const sessionApps = ref(new Map()); // Track all apps opened this session
const currentForegroundApp = ref(null); // Track which app is currently in foreground
const minimizedApps = ref(new Set()); // Track minimized windows

const desktopConfig = computed(() => {
  const config = getDesktopConfig(props.osType);
  console.log('Desktop config for OS type:', props.osType, 'Config:', config);
  console.log('Wallpaper:', config.wallpaper);
  return config;
});

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
  // For iOS in desktop mode, use the fixed iPhone width instead of window width
  let containerWidth = desktopSize.value.width;
  let containerHeight = desktopSize.value.height;
  
  if (props.osType === 'ios' && window.innerWidth >= 768) {
    // When viewing iOS on desktop, use iPhone dimensions
    containerWidth = 375;
    containerHeight = 812;
  }
  
  const position = getDesktopGridPosition(index, containerWidth, containerHeight, props.osType);
  console.log(`Icon ${index} position:`, position, 'OS:', props.osType, 'Container size:', { width: containerWidth, height: containerHeight });
  return position;
};

const openProject = (project) => {
  console.log('Opening project:', project.name);
  
  // Add to session apps if not already there
  const appId = `project-${project.name}`;
  if (!sessionApps.value.has(appId)) {
    sessionApps.value.set(appId, {
      id: appId,
      name: project.name,
      type: 'project',
      icon: getFileIcon('project', props.osType),
      data: project,
      openedAt: new Date()
    });
  }
  
  // Add to active projects if not already there
  if (!activeProjects.value.find(p => p.name === project.name)) {
    activeProjects.value.push(project);
  }
  
  // Set as foreground app
  currentForegroundApp.value = appId;
};

const closeProject = (project) => {
  activeProjects.value = activeProjects.value.filter(p => p.name !== project.name);
  
  // If this was the foreground app, clear it
  const appId = `project-${project.name}`;
  if (currentForegroundApp.value === appId) {
    currentForegroundApp.value = null;
  }
};

const openAbout = () => {
  console.log('Opening About.txt');
  
  // Add to session apps if not already there
  const appId = 'about-txt';
  if (!sessionApps.value.has(appId)) {
    sessionApps.value.set(appId, {
      id: appId,
      name: 'About.txt',
      type: 'text',
      icon: getFileIcon('text', props.osType),
      data: null,
      openedAt: new Date()
    });
  }
  
  showAbout.value = true;
  currentForegroundApp.value = appId;
};

const closeAbout = () => {
  showAbout.value = false;
  
  // If this was the foreground app, clear it
  if (currentForegroundApp.value === 'about-txt') {
    currentForegroundApp.value = null;
  }
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

// Minimize/Restore Methods
const minimizeProject = (project) => {
  const appId = `project-${project.name}`;
  minimizedApps.value.add(appId);
  console.log('Minimized project:', project.name);
};

const minimizeAbout = () => {
  minimizedApps.value.add('about-txt');
  console.log('Minimized About.txt');
};

const restoreApp = (appId) => {
  minimizedApps.value.delete(appId);
  console.log('Restored app:', appId);
};

const getOpenApps = () => {
  // Return all apps that have been opened this session
  const apps = Array.from(sessionApps.value.values());
  
  // Add state information (foreground/background)
  return apps.map(app => ({
    ...app,
    isActive: (app.type === 'project' && activeProjects.value.find(p => p.name === app.name)) ||
              (app.type === 'text' && app.name === 'About.txt' && showAbout.value),
    isForeground: currentForegroundApp.value === app.id
  }));
};

const switchToApp = (app) => {
  console.log('Switching to app:', app.name);
  
  if (app.type === 'project') {
    // If project is not in active list, add it back
    if (!activeProjects.value.find(p => p.name === app.name)) {
      activeProjects.value.push(app.data);
    }
  } else if (app.type === 'text' && app.name === 'About.txt') {
    // If About.txt is not showing, show it
    showAbout.value = true;
  }
  
  // Set as foreground app
  currentForegroundApp.value = app.id;
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
  
  // Remove from session apps when fully closed
  sessionApps.value.delete(app.id);
  
  // Clear foreground if this was the current app
  if (currentForegroundApp.value === app.id) {
    currentForegroundApp.value = null;
  }
};

const goToHome = () => {
  // Hide all apps but keep them in session (like real iPhone)
  activeProjects.value = [];
  showAbout.value = false;
  currentForegroundApp.value = null;
  // Note: sessionApps remains intact so they appear in app switcher
};

// Handle window resize
const updateDesktopSize = () => {
  desktopSize.value = { width: window.innerWidth, height: window.innerHeight };
};

// Handle ESC key functionality
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    if (props.osType === 'ios') {
      // iOS: Toggle app switcher
      if (!isAppSwitcherVisible.value) {
        // Only show app switcher if there are apps in session
        if (sessionApps.value.size > 0) {
          showAppSwitcher();
        }
      } else {
        // If app switcher is already open, close it
        hideAppSwitcher();
      }
    } else if (props.osType === 'windows') {
      // Windows: Minimize the current foreground app
      if (currentForegroundApp.value) {
        const appId = currentForegroundApp.value;
        minimizedApps.value.add(appId);
        
        // Find the app and minimize it
        if (appId.startsWith('project-')) {
          const projectName = appId.replace('project-', '');
          const project = activeProjects.value.find(p => p.name === projectName);
          if (project) {
            minimizeProject(project);
          }
        } else if (appId === 'about-txt') {
          minimizeAbout();
        }
        
        // Clear foreground app
        currentForegroundApp.value = null;
        console.log('Minimized app via ESC:', appId);
      }
    }
    
    // Prevent default ESC behavior (like exiting fullscreen)
    event.preventDefault();
  }
};

onMounted(() => {
  console.log('DesktopView mounted');
  console.log('Projects:', props.projects);
  console.log('OS Type:', props.osType);
  window.addEventListener('resize', updateDesktopSize);
  
  // Add keyboard event listener for ESC key
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('resize', updateDesktopSize);
  document.removeEventListener('keydown', handleKeyDown);
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
  background-size: cover !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed;
  min-height: 100vh;
  min-width: 100vw;
}

/* OS-specific wallpaper sizing */
.windows-98-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
}

.windows-xp-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
}

.windows-vista-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
}

.windows-7-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
}

.windows-8-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
}

.windows-10-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
}

.windows-11-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
}

.macos-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
}

.ios-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
  background-attachment: scroll;
  min-height: 100%;
  min-width: 100%;
}

.linux-desktop .desktop-background {
  background-size: cover !important;
  background-position: center center !important;
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

.linux-desktop {
  font-family: 'Ubuntu', 'Liberation Sans', sans-serif;
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