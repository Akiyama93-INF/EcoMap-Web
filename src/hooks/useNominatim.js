// Hook para búsqueda de lugares mediante Nominatim (OpenStreetMap)
// Limitado únicamente a El Salvador (countrycodes=sv)

import { useState, useCallback, useRef } from 'react'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export const useNominatim = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  const search = useCallback((query) => {
    // Limpiar búsquedas previas
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query || query.trim().length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          q: query.trim(),
          format: 'json',
          countrycodes: 'sv',      // Solo El Salvador
          limit: 6,
          addressdetails: 1,
          'accept-language': 'es',
        })

        const res = await fetch(`${NOMINATIM_URL}?${params}`, {
          headers: {
            // Buena práctica: identificar el cliente para Nominatim
            'User-Agent': 'EcoMap-ElSalvador/1.0',
          },
        })

        if (!res.ok) throw new Error('Error al conectar con el buscador')

        const data = await res.json()
        setResults(data)
      } catch (err) {
        setError('No se pudo realizar la búsqueda. Verifica tu conexión.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400) // debounce 400ms
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  return { results, loading, error, search, clearResults }
}

export default useNominatim
