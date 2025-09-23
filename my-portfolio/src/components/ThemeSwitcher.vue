<script setup>
defineProps({
  currentTheme: String
});
defineEmits(['set-theme']);
</script>

<template>
  <div class="fixed bottom-20 right-4 bg-gray-700 p-4 rounded-lg shadow-2xl border border-pink-400/50">
    <h3 class="font-vt323 text-xl mb-2">Theme</h3>
    <div class="flex flex-col gap-2">
      <button @click="$emit('set-theme', 'windows')" :class="{ 'bg-pink-400 text-black': currentTheme === 'windows' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50">Windows</button>
      <button @click="$emit('set-theme', 'macos')" :class="{ 'bg-pink-400 text-black': currentTheme === 'macos' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50">macOS</button>
      <button @click="$emit('set-theme', 'linux')" :class="{ 'bg-pink-400 text-black': currentTheme === 'linux' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50">Linux</button>
      <button @click="$emit('set-theme', 'ios')" :class="{ 'bg-pink-400 text-black': currentTheme === 'ios' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50">iOS</button>
    </div>
  </div>
</template>