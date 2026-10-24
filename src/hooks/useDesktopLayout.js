import { useEffect, useState } from 'react'

export default function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1025px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1025px)')
    const update = () => setIsDesktop(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return isDesktop
}
