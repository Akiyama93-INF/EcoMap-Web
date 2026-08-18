// Buscador de lugares en El Salvador mediante Nominatim
// Muestra sugerencias y emite la ubicación seleccionada al componente padre

import React, { useState, useRef, useEffect } from 'react'
import useNominatim from '../../hooks/useNominatim'
import '../../styles/components/SearchBar.css'

function SearchBar({ onLocationSelect }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { results, loading, error, search, clearResults } = useNominatim()
  const containerRef = useRef(null)

  // Cerrar dropdown si el usuario hace clic afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setOpen(true)
    search(value)
  }

  const handleSelect = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const displayName = result.display_name

    setQuery(displayName.split(',')[0]) // Mostrar solo el nombre principal
    setOpen(false)
    clearResults()

    if (onLocationSelect) {
      onLocationSelect({ lat, lng, displayName })
    }
  }

  const handleClear = () => {
    setQuery('')
    setOpen(false)
    clearResults()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
      clearResults()
    }
  }

  const showDropdown = open && (results.length > 0 || loading || error)

  return (
    <div className="searchbar-wrapper" ref={containerRef}>
      <div className="searchbar-input-row">
        <svg
          className="searchbar-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          className="searchbar-input"
          placeholder="Buscar en El Salvador..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Buscar ubicación"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />

        {query && (
          <button
            className="searchbar-clear"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="searchbar-dropdown" role="listbox">
          {loading && (
            <li className="searchbar-status">Buscando...</li>
          )}

          {error && !loading && (
            <li className="searchbar-status searchbar-error">{error}</li>
          )}

          {!loading && results.length === 0 && !error && query.length >= 2 && (
            <li className="searchbar-status">No se encontraron resultados en El Salvador</li>
          )}

          {results.map((result) => (
            <li
              key={result.place_id}
              className="searchbar-item"
              onClick={() => handleSelect(result)}
              role="option"
            >
              <svg
                className="searchbar-item-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="14"
                height="14"
                aria-hidden="true"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              <span className="searchbar-item-name">
                {result.display_name.split(',').slice(0, 2).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
