<script setup>
defineProps({
  projects: Array
});
defineEmits(['select-project']);
</script>

<template>
  <aside class="w-full lg:w-64 lg:sticky top-24 self-start bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-pink-400/20">
    <h2 class="font-vt323 text-3xl text-pink-400 mb-4">Projects</h2>
    <ul>
      <li v-for="project in projects" :key="project.name" 
          @click="$emit('select-project', project)"
          class="cursor-pointer p-2 rounded hover:bg-pink-400/20 transition-colors">
        {{ project.name }}
      </li>
    </ul>
  </aside>
</template>
