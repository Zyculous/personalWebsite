<script setup>
const props = defineProps({
  project: Object,
  theme: String
});
defineEmits(['close']);

const getImagePosition = (index) => {
  const pos = props.project.imagePositions[index] || { x: 10, y: 10 };
  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: 'translate(-50%, -50%)'
  };
};
</script>

<template>
  <div class="project-window mb-8" :class="theme + '-theme'">
    <div class="title-bar">
      <div v-if="theme === 'macos'" class="title-bar-buttons">
        <span class="close" @click="$emit('close')"></span>
        <span class="minimize"></span>
        <span class="maximize"></span>
      </div>
      <h2 class="title-bar-text">{{ project.name }}</h2>
      <div v-if="theme === 'windows'" class="title-bar-buttons">
        <span>_</span>
        <span>&#9633;</span>
        <span @click="$emit('close')">X</span>
      </div>
    </div>
    <div class="p-6 relative h-96 overflow-y-auto">
      <p class="text-base mb-4">{{ project.description }}</p>
      <div class="relative h-full">
        <img v-for="(img, index) in project.images" :key="img" :src="img" 
             :style="getImagePosition(index)"
             class="absolute rounded shadow-lg max-w-xs"
             onerror="this.src='https://placehold.co/200x150/2d2d2d/f0f0f0?text=Image+Not+Found'">
      </div>
    </div>
  </div>
</template>
