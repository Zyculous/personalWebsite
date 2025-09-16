<template>
  <div class="h-screen flex items-center justify-center sticky top-0 z-0 pointer-events-none" ref="container">
    <div class="relative w-full h-full text-center">
      <p
        class="scroll-text text-white text-xl transition-opacity duration-300 absolute left-1/2 -translate-x-1/2 bottom-12 z-40"
        :style="{ opacity: scrollOpacity }">
        Scroll Down
      </p>
      <p
        class="scroll-text text-red-500 text-xl transition-opacity duration-300 absolute left-1/2 -translate-x-1/2 bottom-80 z-40"
        :style="{ opacity: scrollOpacity }">
        WORK IN PROGRESS
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import html2canvas from 'html2canvas';

const container = ref(null);
const scrollOpacity = ref(1);
let overlayCanvas = null; // visible canvas that draws pixelated image
let snapshotCanvas = null; // canvas produced by html2canvas
let resizeObserver = null;
let currentProgress = 0;

// tweakables
const MAX_PIXEL = 40; // larger == more blocky
const CAPTURE_SCALE = 1; // html2canvas scale
const DEBUG = true;

function createOverlay() {
  overlayCanvas = document.createElement('canvas');
  overlayCanvas.style.position = 'fixed';
  overlayCanvas.style.left = '0';
  overlayCanvas.style.top = '0';
  overlayCanvas.style.width = '100%';
  overlayCanvas.style.height = '100%';
  // raise z-index to ensure the overlay is above everything
  overlayCanvas.style.zIndex = '2147483647';
  overlayCanvas.style.pointerEvents = 'none';
  overlayCanvas.style.mixBlendMode = 'normal';
  overlayCanvas.style.opacity = '0';
  overlayCanvas.style.transition = 'opacity 180ms linear';
  overlayCanvas.style.display = 'none';
  document.body.appendChild(overlayCanvas);
  if (DEBUG) console.log('[WelcomeScreen] overlay created');
}

async function captureSnapshot() {
  if (!overlayCanvas) return;
  if (DEBUG) console.log('[WelcomeScreen] capturing snapshot...');
  // hide overlay while capturing so it isn't included in the snapshot
  const prevDisplay = overlayCanvas.style.display;
  overlayCanvas.style.display = 'none';

  try {
    // enable useCORS to reduce tainting issues
    snapshotCanvas = await html2canvas(document.body, { backgroundColor: null, scale: CAPTURE_SCALE, logging: DEBUG, useCORS: true });
    if (DEBUG) console.log('[WelcomeScreen] snapshot captured', snapshotCanvas && snapshotCanvas.width, snapshotCanvas && snapshotCanvas.height);
  } catch (e) {
    console.error('html2canvas capture failed:', e);
    snapshotCanvas = null;
  }

  overlayCanvas.style.display = prevDisplay;
  // ensure we render immediately after capture
  renderPixelation(currentProgress);
}

function drawFallback(progress) {
  // Draw a simple pixelated gradient fallback so user sees effect even if snapshot missing
  if (!overlayCanvas) return;
  const w = (overlayCanvas.width = window.innerWidth);
  const h = (overlayCanvas.height = window.innerHeight);
  const ctx = overlayCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  // intensity peaks in the middle of the scroll (bell curve)
  const intensity = Math.max(0, Math.min(1, 4 * progress * (1 - progress)));
  const pixelSize = Math.max(2, Math.round(1 + intensity * (MAX_PIXEL - 1)));
  const colsF = Math.max(2, Math.floor(w / pixelSize));
  const rowsF = Math.max(2, Math.floor(h / pixelSize));
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  for (let y = 0; y < rowsF; y++) {
    for (let x = 0; x < colsF; x++) {
      const r = Math.floor(200 * (x / colsF));
      const g = Math.floor(200 * (y / rowsF));
      const b = Math.floor(200 * ((x + y) / (colsF + rowsF)));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
  // only show overlay when intensity noticeable
  if (intensity > 0.03) {
    overlayCanvas.style.display = 'block';
    overlayCanvas.style.opacity = String(Math.min(1, intensity));
  } else {
    overlayCanvas.style.opacity = '0';
    overlayCanvas.style.display = 'none';
  }
}

function renderPixelation(progress) {
  currentProgress = progress;
  if (!overlayCanvas) return;

  // intensity peaks at 0.5 and is low at 0 and 1
  const intensity = Math.max(0, Math.min(1, 4 * progress * (1 - progress)));
  if (DEBUG) console.log('[WelcomeScreen] renderPixelation', { progress, intensity });

  // hide overlay if negligible
  if (intensity < 0.03) {
  overlayCanvas.style.opacity = '0';
  // completely remove from hit testing when invisible
  overlayCanvas.style.display = 'none';
    return;
  }

  if (!snapshotCanvas) {
    if (DEBUG) console.log('[WelcomeScreen] no snapshot, using fallback');
    drawFallback(progress);
    return;
  }

  const w = (overlayCanvas.width = window.innerWidth);
  const h = (overlayCanvas.height = window.innerHeight);
  // request a 2d context with willReadFrequently to avoid readback warnings
  const ctx = overlayCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // pixelSize now depends on intensity (more intense -> larger blocks)
  const pixelSize = Math.max(1, Math.round(1 + intensity * (MAX_PIXEL - 1)));
  const smallW = Math.max(1, Math.floor(w / pixelSize));
  const smallH = Math.max(1, Math.floor(h / pixelSize));

  const small = document.createElement('canvas');
  small.width = smallW;
  small.height = smallH;
  const sctx = small.getContext('2d', { willReadFrequently: true });
  if (!sctx) return;

  try {
    sctx.drawImage(snapshotCanvas, 0, 0, snapshotCanvas.width, snapshotCanvas.height, 0, 0, smallW, smallH);
  } catch (e) {
    console.error('drawImage failed on small canvas:', e);
    drawFallback(progress);
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = Math.min(1, intensity * 1.2); // slightly amplify
  ctx.drawImage(small, 0, 0, smallW, smallH, 0, 0, w, h);
  ctx.globalAlpha = 1;

  overlayCanvas.style.display = 'block';
  overlayCanvas.style.opacity = String(Math.min(1, intensity * 1.2));
}

function computeProgress() {
  // Use page scroll progress so the effect isn't dependent on intersection.
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  // progress 0..1 for first viewport height scrolled
  let progress = Math.max(0, Math.min(1, scrollY / windowHeight));
  if (DEBUG) console.log('[WelcomeScreen] computeProgress', { scrollY, windowHeight, progress });
  return progress;
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const p = computeProgress();
    scrollOpacity.value = Math.max(0, 1 - p * 1.2);
    renderPixelation(p);
    ticking = false;
  });
}

onMounted(() => {
  createOverlay();
  // ensure welcome container never blocks clicks
  if (container.value) container.value.style.pointerEvents = 'none';
  // capture once after paint
  setTimeout(() => captureSnapshot(), 500);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    // re-capture and resize overlay on resize
    if (overlayCanvas) {
      overlayCanvas.width = window.innerWidth;
      overlayCanvas.height = window.innerHeight;
    }
    captureSnapshot();
  });

  // Re-capture if images finish loading later
  const imgs = Array.from(document.images || []);
  let loadedCount = 0;
  imgs.forEach(img => {
    if (img.complete) {
      loadedCount++;
    } else {
      img.addEventListener('load', () => {
        loadedCount++;
        if (loadedCount === imgs.length) captureSnapshot();
      }, { once: true });
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  // remove overlay
  if (overlayCanvas && overlayCanvas.parentNode) overlayCanvas.parentNode.removeChild(overlayCanvas);
});
</script>

<style scoped>
:root {
  --overlay-z: 9999;
}
.scroll-text {
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
}
</style>
