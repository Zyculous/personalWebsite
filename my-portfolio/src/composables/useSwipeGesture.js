import { ref, onMounted, onUnmounted } from 'vue'

export function useSwipeGesture(element, options = {}) {
  const {
    threshold = 50,
    restraint = 100,
    allowedTime = 300,
    startArea = null // { top, bottom, left, right } constraints for where swipe can start
  } = options

  const swipeDirection = ref(null)
  const isSwipeDetected = ref(false)

  let startX = 0
  let startY = 0
  let startTime = 0
  let distX = 0
  let distY = 0
  let elapsedTime = 0
  let validStart = false

  const isInStartArea = (x, y) => {
    if (!startArea || !element.value) return true
    
    const rect = element.value.getBoundingClientRect()
    const relativeX = x - rect.left
    const relativeY = y - rect.top
    
    if (startArea.top !== undefined && relativeY < startArea.top) return false
    if (startArea.bottom !== undefined && relativeY < rect.height - startArea.bottom) return false
    if (startArea.left !== undefined && relativeX < startArea.left) return false
    if (startArea.right !== undefined && relativeX > rect.width - startArea.right) return false
    
    return true
  }

  const handleTouchStart = (e) => {
    const touchObj = e.changedTouches[0]
    
    // Check if touch started in allowed area
    validStart = isInStartArea(touchObj.clientX, touchObj.clientY)
    if (!validStart) {
      return
    }
    
    swipeDirection.value = null
    isSwipeDetected.value = false
    startX = touchObj.pageX
    startY = touchObj.pageY
    startTime = new Date().getTime()
  }

  const handleTouchEnd = (e) => {
    if (!validStart) {
      return
    }
    
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
    
    validStart = false
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