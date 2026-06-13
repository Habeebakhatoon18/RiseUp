import { useEffect, useState } from 'react'

export function useCountUp(end, isActive, duration = 1800) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isActive) return

    let startTime = null
    let frameId = null

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [end, isActive, duration])

  return count
}
