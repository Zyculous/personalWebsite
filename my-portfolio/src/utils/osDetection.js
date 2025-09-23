/**
 * Utility functions for detecting the user's operating system
 * and providing appropriate desktop theming
 */

export function detectOS() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  
  // Mobile detection first
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'ios';
  }
  
  if (/Android/.test(userAgent)) {
    return 'android';
  }
  
  // Desktop OS detection
  if (userAgent.indexOf("Mac") !== -1 || platform.indexOf("Mac") !== -1) {
    return 'macos';
  }
  
  if (userAgent.indexOf("Win") !== -1 || platform.indexOf("Win") !== -1) {
    return 'windows';
  }
  
  if (userAgent.indexOf("Linux") !== -1 || platform.indexOf("Linux") !== -1) {
    return 'linux';
  }
  
  // Default fallback
  return 'windows';
}

export function getDesktopConfig(osType) {
  const configs = {
    windows: {
      wallpaper: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      taskbarHeight: '48px',
      taskbarPosition: 'bottom',
      taskbarColor: 'rgba(0, 0, 0, 0.8)',
      iconStyle: 'windows',
      windowControls: 'right',
      fileExtensions: {
        project: '.exe',
        text: '.txt'
      }
    },
    macos: {
      wallpaper: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      taskbarHeight: '60px',
      taskbarPosition: 'bottom',
      taskbarColor: 'rgba(255, 255, 255, 0.8)',
      iconStyle: 'macos',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      }
    },
    ios: {
      wallpaper: 'linear-gradient(180deg, #007AFF 0%, #5856D6 50%, #FF3B30 100%)',
      taskbarHeight: '88px',
      taskbarPosition: 'bottom',
      taskbarColor: 'rgba(248, 248, 248, 0.94)',
      iconStyle: 'ios',
      windowControls: 'none',
      fileExtensions: {
        project: '',
        text: ''
      },
      homeIndicator: true,
      statusBar: true
    },
    linux: {
      wallpaper: 'linear-gradient(135deg, #2c3e50 0%, #4a6741 100%)',
      taskbarHeight: '40px',
      taskbarPosition: 'bottom',
      taskbarColor: 'rgba(44, 62, 80, 0.9)',
      iconStyle: 'linux',
      windowControls: 'right',
      fileExtensions: {
        project: '',
        text: '.txt'
      }
    }
  };
  
  return configs[osType] || configs.windows;
}

export function getFileIcon(fileType, osType) {
  const icons = {
    windows: {
      project: '🖥️',
      text: '📄',
      folder: '📁'
    },
    macos: {
      project: '📱',
      text: '📝',
      folder: '📂'
    },
    ios: {
      project: '📱',
      text: '📝',
      folder: '📂'
    },
    linux: {
      project: '⚙️',
      text: '📄',
      folder: '📁'
    }
  };
  
  return icons[osType]?.[fileType] || icons.windows[fileType] || '📄';
}

export function getDesktopGridPosition(index, containerWidth, containerHeight, osType = 'windows') {
  if (osType === 'ios') {
    // iPhone-style grid: 4 icons per row, centered vertically like real iPhone
    const iconSize = 60;
    const spacing = 16;
    const verticalSpacing = 20;
    
    // Center the grid horizontally
    const totalWidth = 4 * iconSize + 3 * spacing;
    const marginX = (containerWidth - totalWidth) / 2;
    
    // Start from top with proper spacing
    const startY = 120; // Account for status bar and some padding
    
    const row = Math.floor(index / 4);
    const col = index % 4;
    
    return {
      x: marginX + col * (iconSize + spacing),
      y: startY + row * (iconSize + verticalSpacing + 30) // Extra space for app names
    };
  }
  
  // Default desktop grid for other OS
  const iconSize = 80;
  const spacing = 20;
  const margin = 40;
  
  const iconsPerRow = Math.floor((containerWidth - 2 * margin) / (iconSize + spacing));
  const row = Math.floor(index / iconsPerRow);
  const col = index % iconsPerRow;
  
  return {
    x: margin + col * (iconSize + spacing),
    y: margin + row * (iconSize + spacing)
  };
}