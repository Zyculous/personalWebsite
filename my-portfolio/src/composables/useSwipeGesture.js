import { ref, onMounted, onUnmounted } from 'vue'

export function useSwipeGesture(element, options = {}) {
  const {
    threshold = 50,
    restraint = 100,
    allowedTime = 300
  } = options

  const swipeDirection = ref(null)
  const isSwipeDetected = ref(false)

  let startX = 0
  let startY = 0
  let startTime = 0
  let distX = 0
  let distY = 0
  let elapsedTime = 0

  const handleTouchStart = (e) => {
    const touchObj = e.changedTouches[0]
    swipeDirection.value = null
    isSwipeDetected.value = false
    startX = touchObj.pageX
    startY = touchObj.pageY
    startTime = new Date().getTime()
  }

  const handleTouchEnd = (e) => {
    const touchObj = e.changedTouches[0]
    distX = touchObj.pageX - startX
    distY = touchObj.pageY - startY
    elapsedTime = new Date().getTime() - startTime

    // Check if swipe meets criteria
    if (elapsedTime <= allowedTime) {
      if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
        // Vertical swipe
        if (distY < 0) {
          swipeDirection.value = 'up'
        } else {
          swipeDirection.value = 'down'
        }
        isSwipeDetected.value = true
      } else if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
        // Horizontal swipe
        if (distX < 0) {
          swipeDirection.value = 'left'
        } else {
          swipeDirection.value = 'right'
        }
        isSwipeDetected.value = true
      }
    }
  }

  const addSwipeListeners = () => {
    if (element.value) {
      element.value.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.value.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  }

  const removeSwipeListeners = () => {
    if (element.value) {
      element.value.removeEventListener('touchstart', handleTouchStart)
      element.value.removeEventListener('touchend', handleTouchEnd)
    }
  }

  onMounted(() => {
    addSwipeListeners()
  })

  onUnmounted(() => {
    removeSwipeListeners()
  })

  return {
    swipeDirection,
    isSwipeDetected,
    addSwipeListeners,
    removeSwipeListeners
  }
}