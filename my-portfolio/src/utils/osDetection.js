/**
 * Utility functions for detecting the user's operating system
 * and providing appropriate desktop theming
 */

export function detectOS() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  
  console.log('User Agent:', userAgent);
  console.log('Platform:', platform);
  
  // Mobile detection first
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    console.log('Detected: iOS');
    return 'ios';
  }
  
  if (/Android/.test(userAgent)) {
    console.log('Detected: Android');
    return 'android';
  }
  
  // Desktop OS detection
  if (userAgent.indexOf("Mac") !== -1 || platform.indexOf("Mac") !== -1) {
    console.log('Detected: macOS, defaulting to macOS Sonoma');
    // Always return macOS Sonoma for any macOS detection
    return 'macos-sonoma';
  }
  
  if (userAgent.indexOf("Win") !== -1 || platform.indexOf("Win") !== -1) {
    console.log('Detected: Windows, defaulting to Windows 11');
    // Always return Windows 11 for any Windows detection
    return 'windows-11';
  }
  
  if (userAgent.indexOf("Linux") !== -1 || platform.indexOf("Linux") !== -1) {
    console.log('Detected: Linux');
    return 'linux';
  }
  
  // Default fallback
  console.log('No OS detected, defaulting to Windows 11');
  return 'windows-11';
}

export function getDesktopConfig(osType) {
  const configs = {
    'windows-xp': {
      wallpaper: 'url("/wallpapers/windows-XP.jpg"), radial-gradient(ellipse at center, #87CEEB 0%, #5EB3F5 30%, #1F5F99 70%, #0F4A7C 100%)',
      taskbarHeight: '40px',
      taskbarPosition: 'bottom',
      taskbarColor: 'linear-gradient(0deg, #215DC6 0%, #3F8FEF  50%, #6BB2FF 100%)',
      iconStyle: 'windows-xp',
      windowControls: 'right',
      fileExtensions: {
        project: '.exe',
        text: '.txt'
      },
      theme: 'Luna'
    },
    'windows-98': {
      wallpaper: 'url("/wallpapers/window-98.png"), linear-gradient(45deg, #008080 0%, #40E0D0 50%, #20B2AA 100%)',
      taskbarHeight: '36px',
      taskbarPosition: 'bottom',
      taskbarColor: 'linear-gradient(0deg, #C0C0C0 0%, #E0E0E0 100%)',
      iconStyle: 'windows-98',
      windowControls: 'right',
      fileExtensions: {
        project: '.exe',
        text: '.txt'
      },
      theme: 'Classic'
    },
    'windows-vista': {
      wallpaper: 'url("/wallpapers/windows-vista.jpg"), radial-gradient(ellipse at center bottom, #000000 0%, #1A4B84 40%, #2E6CB8 70%, #4682B4 100%)',
      taskbarHeight: '44px',
      taskbarPosition: 'bottom',
      taskbarColor: 'rgba(0, 0, 0, 0.7)',
      iconStyle: 'windows-vista',
      windowControls: 'right',
      fileExtensions: {
        project: '.exe',
        text: '.txt'
      },
      theme: 'Aero'
    },
    'windows-7': {
      wallpaper: 'url("/wallpapers/windows-7.jpg"), radial-gradient(ellipse at center, #4682B4 0%, #2E6CB8 30%, #1A4B84 60%, #0F1419 100%)',
      taskbarHeight: '48px',
      taskbarPosition: 'bottom',
      taskbarColor: 'rgba(0, 0, 0, 0.75)',
      iconStyle: 'windows-7',
      windowControls: 'right',
      fileExtensions: {
        project: '.exe',
        text: '.txt'
      },
      theme: 'Aero'
    },
    'windows-8': {
      wallpaper: 'url("/wallpapers/windows-8.jpg"), linear-gradient(135deg, #1BA1E2 0%, #0078D4 50%, #0072BC 100%)',
      taskbarHeight: '48px',
      taskbarPosition: 'bottom',
      taskbarColor: 'rgba(0, 0, 0, 0.9)',
      iconStyle: 'windows-8',
      windowControls: 'right',
      fileExtensions: {
        project: '.appx',
        text: '.txt'
      },
      theme: 'Metro'
    },
    'windows-10': {
      wallpaper: 'url("/wallpapers/windows-10.jpg"), linear-gradient(to bottom right, #0078D4 0%, #106EBE 50%, #005A9E 100%)',
      taskbarHeight: '48px',
      taskbarPosition: 'bottom',
      taskbarColor: 'rgba(0, 0, 0, 0.85)',
      iconStyle: 'windows-10',
      windowControls: 'right',
      fileExtensions: {
        project: '.exe',
        text: '.txt'
      },
      theme: 'Fluent'
    },
    'windows-11': {
      wallpaper: 'url("/wallpapers/windows-11.jpg"), radial-gradient(ellipse at top right, #4CC2FF 0%, #0078D4 30%, #005A9E 60%, #003D6B 100%)',
      taskbarHeight: '48px',
      taskbarPosition: 'bottom',
      taskbarColor: 'rgba(32, 32, 32, 0.9)',
      iconStyle: 'windows-11',
      windowControls: 'right',
      fileExtensions: {
        project: '.exe',
        text: '.txt'
      },
      theme: 'Fluent 2'
    },
    'macos-tiger': {
      wallpaper: 'url("/wallpapers/macos-tiger.jpg"), radial-gradient(ellipse at center, #87CEEB 0%, #4682B4 50%, #2F4F4F 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.95)',
      iconStyle: 'macos-tiger',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Aqua'
    },
    'macos-leopard': {
      wallpaper: 'url("/wallpapers/macos-leopard.jpg"), radial-gradient(ellipse at center, #4A4A4A 0%, #2F2F2F 50%, #1A1A1A 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.95)',
      iconStyle: 'macos-leopard',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Unified'
    },
    'macos-snow-leopard': {
      wallpaper: 'url("/wallpapers/macos-snow-leopard.jpg"), radial-gradient(ellipse at center, #E0E0E0 0%, #C0C0C0 50%, #A0A0A0 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.95)',
      iconStyle: 'macos-snow-leopard',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Aqua'
    },
    'macos-lion': {
      wallpaper: 'url("/wallpapers/macos-lion.jpg"), radial-gradient(ellipse at center, #8B4513 0%, #654321 50%, #3E2723 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.95)',
      iconStyle: 'macos-lion',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Aqua'
    },
    'macos-mountain-lion': {
      wallpaper: 'url("/wallpapers/macos-mountain-lion.jpg"), radial-gradient(ellipse at center, #696969 0%, #4A4A4A 50%, #2F2F2F 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.95)',
      iconStyle: 'macos-mountain-lion',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Aqua'
    },
    'macos-mavericks': {
      wallpaper: 'url("/wallpapers/macos-mavericks.jpg"), radial-gradient(ellipse at center, #1E90FF 0%, #4682B4 50%, #2F4F4F 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.95)',
      iconStyle: 'macos-mavericks',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Aqua'
    },
    'macos-yosemite': {
      wallpaper: 'url("/wallpapers/macos-yosemite.jpg"), radial-gradient(ellipse at center, #FF6B35 0%, #F7931E 25%, #FFD23F 50%, #06FFA5 75%, #4ECDC4 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.9)',
      iconStyle: 'macos-yosemite',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Yosemite'
    },
    'macos-el-capitan': {
      wallpaper: 'url("/wallpapers/macos-el-capitan.jpg"), radial-gradient(ellipse at center, #8B4513 0%, #A0522D 30%, #CD853F 60%, #DEB887 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.9)',
      iconStyle: 'macos-el-capitan',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'El Capitan'
    },
    'macos-sierra': {
      wallpaper: 'url("/wallpapers/macos-sierra.jpg"), radial-gradient(ellipse at center, #4682B4 0%, #5F9EA0 30%, #708090 60%, #2F4F4F 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.9)',
      iconStyle: 'macos-sierra',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Sierra'
    },
    'macos-high-sierra': {
      wallpaper: 'url("/wallpapers/macos-high-sierra.jpg"), radial-gradient(ellipse at center, #2F4F4F 0%, #4682B4 30%, #5F9EA0 60%, #87CEEB 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.9)',
      iconStyle: 'macos-high-sierra',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'High Sierra'
    },
    'macos-mojave': {
      wallpaper: 'url("/wallpapers/macos-mojave.jpg"), radial-gradient(ellipse at center, #8B4513 0%, #A0522D 25%, #D2691E 50%, #FF8C00 75%, #FFA500 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.9)',
      iconStyle: 'macos-mojave',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Mojave'
    },
    'macos-catalina': {
      wallpaper: 'url("/wallpapers/macos-catalina.jpg"), radial-gradient(ellipse at center, #FF4500 0%, #FF6347 25%, #FFA07A 50%, #FFE4B5 75%, #F0F8FF 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.9)',
      iconStyle: 'macos-catalina',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Catalina'
    },
    'macos-big-sur': {
      wallpaper: 'url("/wallpapers/macos-big-sur.jpg"), radial-gradient(ellipse at center, #FF6B35 0%, #F7931E 25%, #FFD23F 50%, #06FFA5 75%, #4ECDC4 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.8)',
      iconStyle: 'macos-big-sur',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Big Sur'
    },
    'macos-monterey': {
      wallpaper: 'url("/wallpapers/macos-monterey.jpg"), radial-gradient(ellipse at center, #1E3A8A 0%, #3B82F6 25%, #06B6D4 50%, #10B981 75%, #F59E0B 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.8)',
      iconStyle: 'macos-monterey',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Monterey'
    },
    'macos-ventura': {
      wallpaper: 'url("/wallpapers/macos-ventura.jpg"), radial-gradient(ellipse at center, #0F172A 0%, #1E293B 25%, #334155 50%, #475569 75%, #64748B 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.8)',
      iconStyle: 'macos-ventura',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Ventura'
    },
    'macos-sonoma': {
      wallpaper: 'url("/wallpapers/macos-sonoma.jpg"), radial-gradient(ellipse at center, #FF6B35 0%, #F7931E 25%, #FFD23F 50%, #06FFA5 75%, #4ECDC4 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.8)',
      iconStyle: 'macos-sonoma',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Sonoma'
    },
    'macos-sequoia': {
      wallpaper: 'url("/wallpapers/macos-sequoia.jpg"), radial-gradient(ellipse at center, #065F46 0%, #047857 25%, #059669 50%, #10B981 75%, #34D399 100%)',
      taskbarHeight: '22px',
      taskbarPosition: 'top',
      taskbarColor: 'rgba(255, 255, 255, 0.8)',
      iconStyle: 'macos-sequoia',
      windowControls: 'left',
      fileExtensions: {
        project: '.app',
        text: '.txt'
      },
      theme: 'Sequoia'
    },
    macos: {
      wallpaper: 'url("/wallpapers/macos.jpg"), radial-gradient(ellipse at center, #FF6B35 0%, #F7931E 25%, #FFD23F 50%, #06FFA5 75%, #4ECDC4 100%)',
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
      wallpaper: 'url("/wallpapers/IOS.jpg"), linear-gradient(180deg, #1C1C1E 0%, #2C2C2E 50%, #3A3A3C 100%)',
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
      wallpaper: 'url("/wallpapers/linux.jpg"), linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)',
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
  
  // If osType is not found, default to windows-11
  const config = configs[osType] || configs['windows-11'];
  console.log('Getting config for osType:', osType, 'Found config:', !!configs[osType]);
  return config;
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
  
  // Normalize macOS variants to 'macos' for icon selection
  const normalizedOsType = osType.startsWith('macos') ? 'macos' : osType;
  
  return icons[normalizedOsType]?.[fileType] || icons.windows[fileType] || '📄';
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
    
    // Start from top with proper spacing (no status bar now)
    const startY = 80; // Reduced from 120 since we removed status bar
    
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