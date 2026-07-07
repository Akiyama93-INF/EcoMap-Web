// Componente interno que controla la navegación programática del mapa
// Recibe una posición y hace flyTo. No renderiza nada visible.

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

function MapFlyTo({ position, zoom = 15 }) {
  const map = useMap()
  const prevPosition = useRef(null)

  useEffect(() => {
    if (!position) return

    // Solo volar si la posición cambió
    const isSame =
      prevPosition.current &&
      prevPosition.current.lat === position.lat &&
      prevPosition.current.lng === position.lng

    if (!isSame) {
      map.flyTo([position.lat, position.lng], zoom, { duration: 1.2 })
      prevPosition.current = position
    }
  }, [position, zoom, map])

  return null
}

export default MapFlyTo
