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