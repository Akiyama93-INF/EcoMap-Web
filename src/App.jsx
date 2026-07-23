// App.jsx
// Actualizado: ThemeProvider envuelve toda la app para compartir isDark globalmente

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar   from './components/Navbar'
import Footer   from './components/Footer'
import Home     from './pages/Home'
import Login    from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import './styles/App.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/"         element={<Home />}     />
              <Route path="/login"    element={<Login />}    />
              <Route path="/register" element={<Register />} />
              <Route path="*"         element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App