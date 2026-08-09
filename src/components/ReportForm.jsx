// ReportForm — Fase 4 + Infraestructura urbana + Cámara nativa Android
// Cámara: en APK usa @capacitor/camera (nativo), en browser usa input file estándar
// Actualizado: botón "Usar mi ubicación" con GPS de alta precisión (solo en scope nacional)

import React, { useState, useEffect, useRef } from 'react'
import { CATEGORIES_ARRAY, INSA_CATEGORIES_ARRAY, getCategoryByName } from '../utils/categories'
import PoleReportFields     from './PoleReportFields'
import WaterReportFields    from './WaterReportFields'
import PipelineReportFields from './PipelineReportFields'
import RoadReportFields     from './RoadReportFields'
import { useCameraNative }  from '../hooks/useCameraNative'
import '../styles/components/ReportForm.css'

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getDistancePx(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

function validateDescription(desc) {
  const trimmed = desc.trim()
  if (trimmed.length < 10)
    return 'La descripción debe tener al menos 10 caracteres.'
  if (/^(.)\\1+$/.test(trimmed))
    return 'La descripción no es válida.'
  if (/^[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]*$/.test(trimmed))
    return 'La descripción debe contener texto legible.'
  return null
}

const INFRA_FIELDS = {
  poste_luz:        'pole',
  chorro_publico:   'water',
  tuberia_danada:   'pipeline',
  obstruccion_vial: 'road',
}

const SUBTYPE_LABELS = {
  poste_luz:        'Tipo de fallo',
  chorro_publico:   'Tipo de daño',
  tuberia_danada:   'Tipo de daño',
  obstruccion_vial: 'Tipo de obstrucción',
}

// ── Hook de GPS de alta precisión (solo para el formulario) ───────────────────
function useFormGeolocation() {
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError,   setGpsError]   = useState(null)

  const getPosition = (onSuccess) => {
    if (!navigator.geolocation) {
      setGpsError('Tu navegador no soporta geolocalización.')
      return
    }

    setGpsLoading(true)
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false)
        onSuccess({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      (err) => {
        setGpsLoading(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGpsError('Permiso de ubicación denegado. Actívalo en la configuración del navegador.')
            break
          case err.POSITION_UNAVAILABLE:
            setGpsError('No se pudo obtener tu ubicación. Intenta de nuevo.')
            break
          case err.TIMEOUT:
            setGpsError('Tiempo de espera agotado. Intenta de nuevo.')
            break
          default:
            setGpsError('Error desconocido al obtener ubicación.')
        }
      },
      {
        enableHighAccuracy: true, // GPS de alta precisión — no IP/wifi
        timeout: 12000,
        maximumAge: 0,            // Sin caché — siempre posición fresca
      }
    )
  }

  return { gpsLoading, gpsError, getPosition }
}

function ReportForm({ location, onSubmit, onCancel, markers = [], onConfirmExisting, scope = 'nacional', onLocationChange }) {
  const availableCategories = scope === 'insa' ? INSA_CATEGORIES_ARRAY : CATEGORIES_ARRAY

  const [formData, setFormData] = useState({
    description:   '',
    category:      availableCategories[0]?.name ?? 'Basurero clandestino',
    image:         null,
    subtypes:      [],
    infraMetadata: {},
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progressMsg,  setProgressMsg]  = useState(null)
  const [error,        setError]        = useState(null)
  const [nearbyReport, setNearbyReport] = useState(null)
  const [gpsAccuracy,  setGpsAccuracy]  = useState(null) // metros de precisión del GPS usado

  const cameraInputRef  = useRef(null)
  const galleryInputRef = useRef(null)

  const { takePhoto, pickFromGallery, isNative, error: camError } = useCameraNative()
  const { gpsLoading, gpsError, getPosition } = useFormGeolocation()

  const MAX_IMAGE_SIZE      = 5 * 1024 * 1024
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  const selectedCat  = getCategoryByName(formData.category) ?? CATEGORIES_ARRAY[0]
  const hasSubtypes  = (selectedCat?.subtypes?.length ?? 0) > 0
  const infraType    = INFRA_FIELDS[selectedCat?.id] ?? null
  const subtypeLabel = SUBTYPE_LABELS[selectedCat?.id] ?? 'Materiales aceptados'

  useEffect(() => {
    if (!location || markers.length === 0) { setNearbyReport(null); return }
    const found = scope === 'insa'
      ? markers.find((m) => getDistancePx(location.lat, location.lng, m.lat, m.lng) <= 30)
      : markers.find((m) => getDistanceMeters(location.lat, location.lng, m.lat, m.lng) <= 50)
    setNearbyReport(found ?? null)
  }, [location, markers, scope])

  const handleCategoryChange = (e) => {
    setFormData((p) => ({ ...p, category: e.target.value, subtypes: [], infraMetadata: {} }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const applyImageFile = (file) => {
    if (!file) return
    setError(null)
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('La imagen no puede superar los 5 MB.')
      return
    }
    setFormData((prev) => ({ ...prev, image: file }))
  }

  // ── Botón "Usar mi ubicación" ─────────────────────────────────────────────
  const handleUseMyLocation = () => {
    getPosition((pos) => {
      setGpsAccuracy(pos.accuracy)
      // Notificar a Home.jsx para actualizar selectedLocation y mover el mapa
      if (onLocationChange) {
        onLocationChange({ lat: pos.lat, lng: pos.lng })
      }
    })
  }

  // ── Cámara ───────────────────────────────────────────────────────────────
  const handleCameraBtn = async () => {
    if (isNative) {
      const file = await takePhoto()
      if (file) applyImageFile(file)
    } else {
      cameraInputRef.current?.click()
    }
  }

  // ── Galería ──────────────────────────────────────────────────────────────
  const handleGalleryBtn = async () => {
    if (isNative) {
      const file = await pickFromGallery()
      if (file) applyImageFile(file)
    } else {
      galleryInputRef.current?.click()
    }
  }

  const handleCameraInputChange  = (e) => applyImageFile(e.target.files[0])
  const handleGalleryInputChange = (e) => applyImageFile(e.target.files[0])

  const removeImage = () => {
    setFormData((p) => ({ ...p, image: null }))
    if (cameraInputRef.current)  cameraInputRef.current.value  = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const toggleSubtype = (id) => {
    setFormData((p) => ({
      ...p,
      subtypes: p.subtypes.includes(id)
        ? p.subtypes.filter((s) => s !== id)
        : [...p.subtypes, id],
    }))
  }

  const handleInfraMetadata = (field, value) => {
    setFormData((p) => ({ ...p, infraMetadata: { ...p.infraMetadata, [field]: value } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const descError = validateDescription(formData.description)
    if (descError) { setError(descError); return }
    if (!location)  { setError('Selecciona una ubicación en el mapa o usa tu GPS'); return }

    setIsSubmitting(true)
    setProgressMsg(formData.image ? 'Subiendo imagen...' : 'Guardando reporte...')

    const metaClean = Object.fromEntries(
      Object.entries(formData.infraMetadata)
        .filter(([, v]) => v !== '' && v !== false && v != null)
    )

    const payload = {
      ...formData,
      location,
      ...(infraType && Object.keys(metaClean).length > 0 ? { metadata: metaClean } : {}),
    }

    try {
      await onSubmit?.(payload, (msg) => setProgressMsg(msg))
      setFormData({
        description: '', category: availableCategories[0]?.name ?? 'Basurero clandestino',
        image: null, subtypes: [], infraMetadata: {},
      })
      setGpsAccuracy(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
      setProgressMsg(null)
    }
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>

      <div className="report-form-header" style={{ borderLeftColor: selectedCat?.color }}>
        <span className="report-form-icon">{selectedCat?.icon}</span>
        <div>
          <h2>Nuevo reporte</h2>
          <p className="report-form-subtitle">{selectedCat?.description}</p>
        </div>
      </div>

      {(error || camError) && <div className="error-message">{error || camError}</div>}

      {isSubmitting && progressMsg && (
        <div className="progress-message">
          <span className="progress-spinner" />
          {progressMsg}
        </div>
      )}

      {nearbyReport && !isSubmitting && (
        <div className="nearby-report-warning">
          <p className="nearby-report-title">Ya existe un reporte cercano a este punto.</p>
          <p className="nearby-report-desc">
            {nearbyReport.category} — {nearbyReport.description?.slice(0, 60)}...
          </p>
          <div className="nearby-report-actions">
            <button type="button" className="nearby-confirm-btn"
              onClick={() => onConfirmExisting?.(nearbyReport)}>
              Confirmar reporte existente
            </button>
            <button type="button" className="nearby-ignore-btn"
              onClick={() => setNearbyReport(null)}>
              Ignorar y crear nuevo
            </button>
          </div>
        </div>
      )}

      {/* Categoría */}
      <div className="form-group">
        <label>Categoría *</label>
        <div className="category-selector">
          {availableCategories.map((cat) => (
            <label
              key={cat.id}
              className={`category-option${formData.category === cat.name ? ' selected' : ''}`}
              style={formData.category === cat.name
                ? { borderColor: cat.color, backgroundColor: cat.color + '15' } : {}}
            >
              <input type="radio" name="category" value={cat.name}
                checked={formData.category === cat.name} onChange={handleCategoryChange} />
              <span className="category-option-icon">{cat.icon}</span>
              <span className="category-option-name">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subtypes */}
      {hasSubtypes && (
        <div className="form-group">
          <label>{subtypeLabel} <span className="optional">(opcional)</span></label>
          <div className="subtype-grid">
            {selectedCat.subtypes.map((sub) => {
              const active = formData.subtypes.includes(sub.id)
              return (
                <button key={sub.id} type="button"
                  className={`subtype-chip${active ? ' active' : ''}`}
                  style={active ? { borderColor: selectedCat.color,
                    backgroundColor: selectedCat.color + '18', color: selectedCat.mapColor } : {}}
                  onClick={() => toggleSubtype(sub.id)}>
                  {sub.icon} {sub.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {infraType === 'pole'     && <PoleReportFields     values={formData.infraMetadata} onChange={handleInfraMetadata} />}
      {infraType === 'water'    && <WaterReportFields    values={formData.infraMetadata} onChange={handleInfraMetadata} />}
      {infraType === 'pipeline' && <PipelineReportFields values={formData.infraMetadata} onChange={handleInfraMetadata} />}
      {infraType === 'road'     && <RoadReportFields     values={formData.infraMetadata} onChange={handleInfraMetadata} />}

      {/* Descripción */}
      <div className="form-group">
        <label htmlFor="description">Descripción *</label>
        <textarea id="description" name="description" value={formData.description}
          onChange={handleChange}
          placeholder="Describe la situación con al menos 10 caracteres..." rows={4} />
        <small className="desc-counter"
          style={{ color: formData.description.trim().length < 10 ? '#e74c3c' : '#27ae60' }}>
          {formData.description.trim().length} / 10 caracteres mínimo
        </small>
      </div>

      {/* Fotografía */}
      <div className="form-group">
        <label>Fotografía <span className="optional">(opcional)</span></label>

        {formData.image ? (
          <div className="image-preview-container">
            <div className="image-preview-wrapper">
              <img src={URL.createObjectURL(formData.image)} alt="Vista previa"
                className="image-preview" />
            </div>
            <div className="image-preview-footer">
              <p className="file-name">📎 {formData.image.name}</p>
              <button type="button" className="image-remove-btn"
                onClick={removeImage} aria-label="Eliminar imagen">
                ✕ Quitar
              </button>
            </div>
          </div>
        ) : (
          <div className="image-capture-row">
            <button type="button"
              className="image-capture-btn image-capture-btn--camera"
              onClick={handleCameraBtn}>
              📷 Tomar foto
            </button>
            <button type="button"
              className="image-capture-btn image-capture-btn--gallery"
              onClick={handleGalleryBtn}>
              🖼 Galería
            </button>

            {/* Inputs ocultos — solo usados en browser, ignorados en APK nativa */}
            <input ref={cameraInputRef} type="file"
              accept="image/jpeg,image/png,image/webp" capture="environment"
              onChange={handleCameraInputChange} className="image-input-hidden" aria-hidden="true" />
            <input ref={galleryInputRef} type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleGalleryInputChange} className="image-input-hidden" aria-hidden="true" />
          </div>
        )}

        <small className="image-help">JPG · PNG · WEBP · Máx. 5 MB</small>
      </div>

      {/* Ubicación — solo en scope nacional */}
      {scope !== 'insa' && (
        <div className="form-group">
          <label>Ubicación *</label>

          {/* Botón GPS preciso */}
          <button
            type="button"
            className="gps-location-btn"
            onClick={handleUseMyLocation}
            disabled={gpsLoading || isSubmitting}
          >
            {gpsLoading
              ? <><span className="progress-spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Obteniendo GPS...</>
              : '📍 Usar mi ubicación'}
          </button>

          {gpsError && (
            <p className="gps-error">{gpsError}</p>
          )}

          {location && (
            <div className="location-info" style={{ marginTop: '0.5rem' }}>
              <span>✅</span>
              <span>
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                {gpsAccuracy !== null && (
                  <span className="location-accuracy"> · precisión ~{Math.round(gpsAccuracy)} m</span>
                )}
              </span>
            </div>
          )}

          {!location && !gpsLoading && (
            <p className="location-hint">
              Toca "Usar mi ubicación" o haz clic directamente en el mapa.
            </p>
          )}
        </div>
      )}

      {/* Ubicación INSA — solo coordenadas del plano */}
      {scope === 'insa' && location && (
        <div className="location-info">
          <span>📍</span>
          <span>Posición en el plano: ({Math.round(location.lat)}, {Math.round(location.lng)})</span>
        </div>
      )}

      {selectedCat?.applyPrivacy && scope !== 'insa' && (
        <div className="privacy-notice">
          <span>🔒</span>
          <span>Tu ubicación exacta no será pública. En el mapa aparecerá un punto aproximado dentro de un radio de ~400 m.</span>
        </div>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="cancel-btn" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        )}
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? progressMsg ?? 'Enviando...' : 'Enviar reporte'}
        </button>
      </div>
    </form>
  )
}

export default ReportForm