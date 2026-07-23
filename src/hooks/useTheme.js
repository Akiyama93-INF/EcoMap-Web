// hooks/useTheme.js
// Actualizado: lee del ThemeContext en lugar de tener estado propio
// Todos los componentes comparten el mismo isDark

import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return context
}

export default useTheme