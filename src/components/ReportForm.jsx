// ReportForm — Fase 4 + Infraestructura urbana
// Añadido:
//   - Importación de WaterReportFields, PipelineReportFields, RoadReportFields
//   - Secciones condicionales para chorro_publico, tuberia_danada, obstruccion_vial
//   - metadata se construye limpio antes del submit (sin campos vacíos)

import React, { useState, useEffect } from 'react'
import { CATEGORIES_ARRAY, getCategoryByName } from '../utils/categories'
import PoleReportFields     from './PoleReportFields'
import WaterReportFields    from './WaterReportFields'
import PipelineReportFields from './PipelineReportFields'
import RoadReportFields     from './RoadReportFields'
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

function validateDescription(desc) {
  const trimmed = desc.trim()
  if (trimmed.length < 10)
    return 'La descripción debe tener al menos 10 caracteres.'
  if (/^(.)\1+$/.test(trimmed))
    return 'La descripción no es válida.'
  if (/^[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]*$/.test(trimmed))
    return 'La descripción debe contener texto legible.'
  return null
}

// IDs de categorías que tienen campos extra opcionales
const INFRA_FIELDS = {
  poste_luz:        'pole',
  chorro_publico:   'water',
  tuberia_danada:   'pipeline',
  obstruccion_vial: 'road',
}

// Label del bloque de subtypes según categoría
const SUBTYPE_LABELS = {
  poste_luz:        'Tipo de fallo',
  chorro_publico:   'Tipo de daño',
  tuberia_danada:   'Tipo de daño',
  obstruccion_vial: 'Tipo de obstrucción',
}

function ReportForm({ location, onSubmit, onCancel, markers = [], onConfirmExisting }) {
  const [formData, setFormData] = useState({
    description:   '',
    category:      CATEGORIES_ARRAY[0]?.name ?? 'Basurero clandestino',
    image:         null,
    subtypes:      [],
    infraMetadata: {},
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progressMsg,  setProgressMsg]  = useState(null)
  const [error,        setError]        = useState(null)
  const [nearbyReport, setNearbyReport] = useState(null)

  const MAX_IMAGE_SIZE      = 5 * 1024 * 1024
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  const selectedCat   = getCategoryByName(formData.category) ?? CATEGORIES_ARRAY[0]
  const hasSubtypes   = (selectedCat?.subtypes?.length ?? 0) > 0
  const infraType     = INFRA_FIELDS[selectedCat?.id] ?? null
  const subtypeLabel  = SUBTYPE_LABELS[selectedCat?.id] ?? 'Materiales aceptados'

  useEffect(() => {
    if (!location || markers.length === 0) { setNearbyReport(null); return }
    const found = markers.find((m) =>
      getDistanceMeters(location.lat, location.lng, m.lat, m.lng) <= 50
    )
    setNearbyReport(found ?? null)
  }, [location, markers])

  const handleCategoryChange = (e) => {
    setFormData((p) => ({
      ...p,
      category:      e.target.value,
      subtypes:      [],
      infraMetadata: {},
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError(null)
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('La imagen no puede superar los 5 MB.')
      e.target.value = ''
      return
    }
    setFormData((prev) => ({ ...prev, image: file }))
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
    setFormData((p) => ({
      ...p,
      infraMetadata: { ...p.infraMetadata, [field]: value },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const descError = validateDescription(formData.description)
    if (descError) { setError(descError); return }
    if (!location)  { setError('Selecciona una ubicación en el mapa'); return }

    setIsSubmitting(true)
    setProgressMsg(formData.image ? 'Subiendo imagen...' : 'Guardando reporte...')

    // Limpiar metadata: solo campos con valor real
    const metaClean = Object.fromEntries(
      Object.entries(formData.infraMetadata)
        .filter(([, v]) => v !== '' && v !== false && v != null)
    )

    const payload = {
      ...formData,
      location,
      ...(infraType && Object.keys(metaClean).length > 0
        ? { metadata: metaClean }
        : {}),
    }

    try {
      await onSubmit?.(payload, (msg) => setProgressMsg(msg))
      setFormData({
        description:   '',
        category:      CATEGORIES_ARRAY[0]?.name ?? 'Basurero clandestino',
        image:         null,
        subtypes:      [],
        infraMetadata: {},
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
      setProgressMsg(null)
    }
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>

      {/* Encabezado dinámico */}
      <div className="report-form-header" style={{ borderLeftColor: selectedCat?.color }}>
        <span className="report-form-icon">{selectedCat?.icon}</span>
        <div>
          <h2>Nuevo reporte</h2>
          <p className="report-form-subtitle">{selectedCat?.description}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Progreso */}
      {isSubmitting && progressMsg && (
        <div className="progress-message">
          <span className="progress-spinner" />
          {progressMsg}
        </div>
      )}

      {/* Reporte cercano */}
      {nearbyReport && !isSubmitting && (
        <div className="nearby-report-warning">
          <p className="nearby-report-title">
            Ya existe un reporte cercano a este punto.
          </p>
          <p className="nearby-report-desc">
            {nearbyReport.category} — {nearbyReport.description?.slice(0, 60)}...
          </p>
          <div className="nearby-report-actions">
            <button
              type="button"
              className="nearby-confirm-btn"
              onClick={() => onConfirmExisting?.(nearbyReport)}
            >
              Confirmar reporte existente
            </button>
            <button
              type="button"
              className="nearby-ignore-btn"
              onClick={() => setNearbyReport(null)}
            >
              Ignorar y crear nuevo
            </button>
          </div>
        </div>
      )}

      {/* Categoría */}
      <div className="form-group">
        <label>Categoría *</label>
        <div className="category-selector">
          {CATEGORIES_ARRAY.map((cat) => (
            <label
              key={cat.id}
              className={`category-option${formData.category === cat.name ? ' selected' : ''}`}
              style={
                formData.category === cat.name
                  ? { borderColor: cat.color, backgroundColor: cat.color + '15' }
                  : {}
              }
            >
              <input
                type="radio"
                name="category"
                value={cat.name}
                checked={formData.category === cat.name}
                onChange={handleCategoryChange}
              />
              <span className="category-option-icon">{cat.icon}</span>
              <span className="category-option-name">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subtypes */}
      {hasSubtypes && (
        <div className="form-group">
          <label>
            {subtypeLabel}{' '}
            <span className="optional">(opcional)</span>
          </label>
          <div className="subtype-grid">
            {selectedCat.subtypes.map((sub) => {
              const active = formData.subtypes.includes(sub.id)
              return (
                <button
                  key={sub.id}
                  type="button"
                  className={`subtype-chip${active ? ' active' : ''}`}
                  style={active
                    ? { borderColor: selectedCat.color, backgroundColor: selectedCat.color + '18', color: selectedCat.mapColor }
                    : {}}
                  onClick={() => toggleSubtype(sub.id)}
                >
                  {sub.icon} {sub.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Campos extra por categoría de infraestructura */}
      {infraType === 'pole'     && (
        <PoleReportFields
          values={formData.infraMetadata}
          onChange={handleInfraMetadata}
        />
      )}
      {infraType === 'water'    && (
        <WaterReportFields
          values={formData.infraMetadata}
          onChange={handleInfraMetadata}
        />
      )}
      {infraType === 'pipeline' && (
        <PipelineReportFields
          values={formData.infraMetadata}
          onChange={handleInfraMetadata}
        />
      )}
      {infraType === 'road'     && (
        <RoadReportFields
          values={formData.infraMetadata}
          onChange={handleInfraMetadata}
        />
      )}

      {/* Descripción */}
      <div className="form-group">
        <label htmlFor="description">Descripción *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe la situación con al menos 10 caracteres..."
          rows={4}
        />
        <small
          className="desc-counter"
          style={{ color: formData.description.trim().length < 10 ? '#e74c3c' : '#27ae60' }}
        >
          {formData.description.trim().length} / 10 caracteres mínimo
        </small>
      </div>

      {/* Fotografía */}
      <div className="form-group">
        <label htmlFor="image">
          Fotografía <span className="optional">(opcional)</span>
          <br />
          <small className="image-help">
            Formatos permitidos: JPG, PNG y WEBP • Máximo 5 MB
          </small>
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
        />
        {formData.image && (
          <div className="image-preview-container">
            <div className="image-preview-wrapper">
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Vista previa"
                className="image-preview"
              />
            </div>
            <p className="file-name">📎 {formData.image.name}</p>
          </div>
        )}
      </div>

      {/* Ubicación */}
      {location && (
        <div className="location-info">
          <span>📍</span>
          <span>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
        </div>
      )}

      {/* Aviso de privacidad */}
      {selectedCat?.applyPrivacy && (
        <div className="privacy-notice">
          <span>🔒</span>
          <span>
            Tu ubicación exacta no será pública. En el mapa aparecerá un punto aproximado dentro de un radio de ~400 m.
          </span>
        </div>
      )}

      {/* Acciones */}
      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
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
