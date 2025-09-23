<script setup>
defineProps({
  currentTheme: String
});
defineEmits(['set-theme']);
</script>

<template>
  <div class="fixed bottom-20 right-4 bg-gray-700 p-4 rounded-lg shadow-2xl border border-pink-400/50 max-h-96 overflow-y-auto">
    <h3 class="font-vt323 text-xl mb-2">Theme</h3>
    <div class="flex flex-col gap-2">
      <div class="text-sm text-gray-300 mb-1">Windows Versions</div>
      <button @click="$emit('set-theme', 'windows-98')" :class="{ 'bg-pink-400 text-black': currentTheme === 'windows-98' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">Windows 98</button>
      <button @click="$emit('set-theme', 'windows-xp')" :class="{ 'bg-pink-400 text-black': currentTheme === 'windows-xp' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">Windows XP</button>
      <button @click="$emit('set-theme', 'windows-vista')" :class="{ 'bg-pink-400 text-black': currentTheme === 'windows-vista' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">Windows Vista</button>
      <button @click="$emit('set-theme', 'windows-7')" :class="{ 'bg-pink-400 text-black': currentTheme === 'windows-7' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">Windows 7</button>
      <button @click="$emit('set-theme', 'windows-8')" :class="{ 'bg-pink-400 text-black': currentTheme === 'windows-8' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">Windows 8</button>
      <button @click="$emit('set-theme', 'windows-10')" :class="{ 'bg-pink-400 text-black': currentTheme === 'windows-10' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">Windows 10</button>
      <button @click="$emit('set-theme', 'windows-11')" :class="{ 'bg-pink-400 text-black': currentTheme === 'windows-11' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">Windows 11</button>
      
      <div class="text-sm text-gray-300 mb-1 mt-2">Other OS</div>
      <button @click="$emit('set-theme', 'macos')" :class="{ 'bg-pink-400 text-black': currentTheme === 'macos' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">macOS</button>
      <button @click="$emit('set-theme', 'linux')" :class="{ 'bg-pink-400 text-black': currentTheme === 'linux' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">Linux</button>
      <button @click="$emit('set-theme', 'ios')" :class="{ 'bg-pink-400 text-black': currentTheme === 'ios' }" class="px-3 py-1 rounded transition-colors hover:bg-pink-400/50 text-left">iOS</button>
    </div>
  </div>
</template>