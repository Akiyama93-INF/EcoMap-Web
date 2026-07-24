// components/RoadReportFields.jsx — nuevo en Fase 4 (Obstrucción vial)
// Campos extra opcionales para la categoría obstruccion_vial.
// Props:
//   values   — objeto metadata del formData padre
//   onChange — función (field, value) => void

import React from 'react'
import '../styles/components/RoadReportFields.css'

const LANE_BLOCKED = [
  { id: 'carril_parcial', label: 'Carril parcial'      },
  { id: 'carril_completo',label: 'Un carril completo'  },
  { id: 'calle_completa', label: 'Calle completa'      },
]

const ESTIMATED_SIZE = [
  { id: 'pequeno', label: 'Pequeño' },
  { id: 'mediano', label: 'Mediano' },
  { id: 'grande',  label: 'Grande'  },
]

function RoadReportFields({ values = {}, onChange }) {
  const handle = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    onChange(field, val)
  }

  return (
    <div className="road-fields">
      <div className="road-fields-header">
        <span className="road-fields-icon">🚧</span>
        <div>
          <p className="road-fields-title">Detalles de la obstrucción</p>
          <p className="road-fields-subtitle">Todos los campos son opcionales pero ayudan a agilizar la atención</p>
        </div>
      </div>

      {/* Carril bloqueado */}
      <div className="road-field-group">
        <label>
          Carril(es) bloqueado(s)
          <span className="road-optional"> (opcional)</span>
        </label>
        <div className="road-option-grid">
          {LANE_BLOCKED.map((l) => (
            <label
              key={l.id}
              className={`road-option${values.laneBlocked === l.id ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="laneBlocked"
                value={l.id}
                checked={values.laneBlocked === l.id}
                onChange={handle('laneBlocked')}
              />
              {l.label}
            </label>
          ))}
        </div>
      </div>

      {/* Tamaño estimado */}
      <div className="road-field-group">
        <label>
          Tamaño estimado de la obstrucción
          <span className="road-optional"> (opcional)</span>
        </label>
        <div className="road-option-grid">
          {ESTIMATED_SIZE.map((s) => (
            <label
              key={s.id}
              className={`road-option road-size-${s.id}${values.estimatedSize === s.id ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="estimatedSize"
                value={s.id}
                checked={values.estimatedSize === s.id}
                onChange={handle('estimatedSize')}
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="road-field-group road-checkbox-group">
        <label className="road-checkbox-label">
          <input
            type="checkbox"
            checked={values.hasSignage ?? false}
            onChange={handle('hasSignage')}
          />
          <span>Hay señalización de advertencia en el lugar</span>
        </label>
        <label className="road-checkbox-label">
          <input
            type="checkbox"
            checked={values.affectsPedestrians ?? false}
            onChange={handle('affectsPedestrians')}
          />
          <span>Afecta el paso peatonal</span>
        </label>
        <label className="road-checkbox-label">
          <input
            type="checkbox"
            checked={values.isRecurring ?? false}
            onChange={handle('isRecurring')}
          />
          <span>Es un punto de obstrucción frecuente</span>
        </label>
      </div>
    </div>
  )
}

export default RoadReportFields
