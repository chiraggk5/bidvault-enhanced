import { useState, useEffect } from 'react'

export function useCountdown(endsAt) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const calc = () => Math.max(0, new Date(endsAt) - Date.now())
    setTimeLeft(calc())
    const id = setInterval(() => setTimeLeft(calc()), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const days = Math.floor(timeLeft / 86400000)
  const hours = Math.floor((timeLeft % 86400000) / 3600000)
  const minutes = Math.floor((timeLeft % 3600000) / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)

  const isUrgent = timeLeft < 600000 && timeLeft > 0 // < 10 min
  const isEnded = timeLeft === 0

  return { days, hours, minutes, seconds, isUrgent, isEnded, total: timeLeft }
}
