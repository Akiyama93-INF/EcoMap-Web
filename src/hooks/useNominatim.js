// Hook para búsqueda de lugares mediante Nominatim (OpenStreetMap)
// Limitado únicamente a El Salvador (countrycodes=sv)
// Actualizado:
//   - AbortController: cancela petición anterior antes de mandar nueva
//   - Debounce subido a 600ms para respetar rate limit de Nominatim
//   - Header Referer agregado para evitar bloqueos

import { useState, useCallback, useRef } from 'react'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export const useNominatim = () => {
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState(null)
  const debounceRef  = useRef(null)
  const abortRef     = useRef(null) // ← cancela la petición en vuelo

  const search = useCallback((query) => {
    // Cancelar debounce anterior
    if (debounceRef.current) clearTimeout(debounceRef.current)

    // Cancelar petición HTTP anterior si todavía está en vuelo
    if (abortRef.current) abortRef.current.abort()

    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      // Crear nuevo AbortController para esta petición
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          q:               query.trim(),
          format:          'json',
          countrycodes:    'sv',
          limit:           6,
          addressdetails:  1,
          'accept-language': 'es',
        })

        const res = await fetch(`${NOMINATIM_URL}?${params}`, {
          signal: controller.signal, // ← permite cancelar
          headers: {
            'User-Agent': 'EcoMap-ElSalvador/1.0',
            'Referer':    'https://ecomap.app', // ← recomendado por Nominatim
          },
        })

        if (!res.ok) throw new Error('Error al conectar con el buscador')

        const data = await res.json()
        setResults(data)
      } catch (err) {
        // AbortError es normal — no mostrar como error al usuario
        if (err.name === 'AbortError') return
        setError('No se pudo realizar la búsqueda. Verifica tu conexión.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 600) // ← subido de 400ms a 600ms
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current)    abortRef.current.abort()
  }, [])

  return { results, loading, error, search, clearResults }
}

export default useNominatim