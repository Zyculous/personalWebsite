<template>
  <div 
    class="desktop-icon"
    :class="[osType + '-icon', { 'selected': isSelected }]"
    :style="{ 
      left: position.x + 'px', 
      top: position.y + 'px',
      transform: isSelected ? 'scale(1.1)' : 'scale(1)'
    }"
    @click="handleClick"
    @dblclick="handleDoubleClick"
  >
    <div class="icon-image">
      {{ icon }}
    </div>
    <div class="icon-label">
      {{ label }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  icon: String,
  label: String,
  position: Object,
  osType: String
});

const emit = defineEmits(['click', 'double-click']);

const isSelected = ref(false);

const handleClick = () => {
  console.log('Single click on:', props.label);
  isSelected.value = true;
  
  // Clear selection after a delay
  setTimeout(() => {
    isSelected.value = false;
  }, 2000);
  
  emit('click');
};

const handleDoubleClick = (e) => {
  console.log('Double click on:', props.label);
  // Prevent the click event from firing
  e.stopPropagation();
  isSelected.value = false;
  emit('double-click');
};
</script>

<style scoped>
.desktop-icon {
  position: absolute;
  width: 80px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  user-select: none;
}

.desktop-icon:hover {
  transform: scale(1.05) !important;
}

.desktop-icon.selected {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.icon-image {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.icon-label {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  word-wrap: break-word;
  line-height: 1.2;
  max-width: 80px;
  padding: 2px 4px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
}

/* OS-specific icon styles */
.windows-icon .icon-image {
  border-radius: 8px;
}

/* Windows 98 style - classic 3D look */
.windows-98-icon .icon-image {
  border-radius: 2px;
  background: linear-gradient(145deg, #C0C0C0 0%, #A0A0A0 100%);
  border: 2px outset #C0C0C0;
  box-shadow: inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #808080;
}

.windows-98-icon .icon-label {
  color: #000000;
  background: none;
  text-shadow: none;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
}

/* Windows XP style - Luna theme */
.windows-xp-icon .icon-image {
  border-radius: 8px;
  background: linear-gradient(145deg, #3F8FEF 0%, #215DC6 100%);
  border: 1px solid #1F5F99;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.windows-xp-icon .icon-label {
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-family: 'Tahoma', sans-serif;
  font-size: 11px;
}

/* Windows Vista style - Aero glass effect */
.windows-vista-icon .icon-image {
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.windows-vista-icon .icon-label {
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.4);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-family: 'Segoe UI', sans-serif;
  font-size: 11px;
}

/* Windows 7 style - refined Aero */
.windows-7-icon .icon-image {
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.windows-7-icon .icon-label {
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.4);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-family: 'Segoe UI', sans-serif;
  font-size: 11px;
}

/* Windows 8 style - Metro flat design */
.windows-8-icon {
  width: 80px;
  height: 80px;
}

.windows-8-icon .icon-image {
  width: 64px;
  height: 64px;
  border-radius: 0;
  background: #1BA1E2;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
}

.windows-8-icon .icon-label {
  color: #FFFFFF;
  background: none;
  text-shadow: none;
  font-family: 'Segoe UI', sans-serif;
  font-size: 11px;
  font-weight: 300;
}

/* Windows 10 style - modern flat with subtle shadows */
.windows-10-icon .icon-image {
  border-radius: 6px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.windows-10-icon .icon-label {
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
  font-family: 'Segoe UI', sans-serif;
  font-size: 11px;
  font-weight: 400;
}

/* Windows 11 style - rounded modern design */
.windows-11-icon .icon-image {
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.windows-11-icon .icon-label {
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.25);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  font-family: 'Segoe UI Variable', 'Segoe UI', sans-serif;
  font-size: 11px;
  font-weight: 400;
}

.macos-icon .icon-image {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ios-icon {
  width: 60px;
  height: 80px;
}

.ios-icon .icon-image {
  width: 60px;
  height: 60px;
  border-radius: 13px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  background: linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%);
  font-size: 36px;
  margin-bottom: 4px;
  border: none;
  backdrop-filter: none;
}

.ios-icon .icon-label {
  font-size: 11px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  background: none;
  padding: 0;
  max-width: 60px;
  line-height: 1.1;
}

.linux-icon .icon-image {
  border-radius: 6px;
}
</style>