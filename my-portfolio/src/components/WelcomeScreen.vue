<script setup>
import { ref, onMounted } from 'vue';
import { animate, createTimeline } from 'animejs';

const container = ref(null);
const pixelTitle = ref(null);
const scrollOpacity = ref(1);
const cols = ref(64); // Grid columns
const rows = ref(12); // Grid rows

let animation;

onMounted(() => {
  // Create pixel grid
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < cols.value * rows.value; i++) {
    const pixel = document.createElement('div');
    pixel.classList.add('pixel');
    fragment.appendChild(pixel);
  }
  pixelTitle.value.appendChild(fragment);

  // Text to render
  const textData = [
    { text: 'PIXEL', y: 2, color: '#32cd32' },
    { text: 'PORTFOLIO', y: 7, color: '#ff69b4' }
  ];

  // Create anime.js timeline using createTimeline
  animation = createTimeline({
    autoplay: false, // We will control it with scroll
  });

  // Initial random pixel flash
  animation.add({
    targets: '.pixel',
    opacity: [0, 1],
    backgroundColor: '#FFF',
    delay: (el, i, l) => i * 10, // anime.stagger replacement
    duration: 500,
    easing: 'easeInOutQuad'
  }).add({
    targets: '.pixel',
    opacity: 0,
    delay: (el, i, l) => i * 10, // anime.stagger replacement
    duration: 500,
    easing: 'easeInOutQuad'
  }, '-=200');

  // Render text with pixels
  textData.forEach(item => {
    const textLength = item.text.length;
    const startCol = Math.floor((cols.value - textLength) / 2);
    for (let i = 0; i < textLength; i++) {
      const col = startCol + i;
      const index = item.y * cols.value + col;
      animation.add({
        targets: `.pixel:nth-child(${index + 1})`,
        opacity: 1,
        backgroundColor: item.color,
      }, 1000); // Start text animation at 1s
    }
  });

  // Intersection Observer to control animation
  const observer = new IntersectionObserver(
    ([entry]) => {
      const ratio = entry.intersectionRatio;
      scrollOpacity.value = Math.max(0, 1 - (1 - ratio) * 5);
      // Seek animation timeline based on scroll
      if (animation) {
        animation.seek(animation.duration * ratio);
      }
    },
    { threshold: Array.from(Array(101).keys(), i => i / 100) }
  );
  if (container.value) {
    observer.observe(container.value);
  }
});
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center sticky top-0 -z-10" ref="container">
    <div class="text-center">
      <div ref="pixelTitle" class="pixel-grid" :style="{'--cols': cols}"></div>
      <p class="text-white text-xl mt-8 transition-opacity duration-1000" :style="{ opacity: scrollOpacity }">Scroll Down</p>
    </div>
  </div>
</template>
