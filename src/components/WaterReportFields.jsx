// components/WaterReportFields.jsx — nuevo en Fase 4 (Chorro público dañado)
// Campos extra opcionales para la categoría chorro_publico.
// Props:
//   values   — objeto poleMetadata / waterMetadata del formData padre
//   onChange — función (field, value) => void

import React from 'react'
import '../styles/components/WaterReportFields.css'

const INSTITUTION_TYPES = [
  { id: '',        label: 'No lo sé / No aplica' },
  { id: 'ANDA',    label: 'ANDA'                 },
  { id: 'alcaldia',label: 'Alcaldía'             },
  { id: 'otro',    label: 'Otro'                 },
]

const AFFECTS_PEOPLE = [
  { id: 'solo_chorro', label: 'Solo ese chorro' },
  { id: 'calle',       label: 'Una calle'       },
  { id: 'colonia',     label: 'Toda la colonia' },
]

function WaterReportFields({ values = {}, onChange }) {
  const handle = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    onChange(field, val)
  }

  return (
    <div className="water-fields">
      <div className="water-fields-header">
        <span className="water-fields-icon">🚰</span>
        <div>
          <p className="water-fields-title">Detalles del chorro</p>
          <p className="water-fields-subtitle">Todos los campos son opcionales pero ayudan a agilizar la atención</p>
        </div>
      </div>

      {/* Institución responsable */}
      <div className="water-field-group">
        <label htmlFor="institutionType">
          Institución responsable
          <span className="water-optional"> (opcional)</span>
        </label>
        <select
          id="institutionType"
          value={values.institutionType ?? ''}
          onChange={handle('institutionType')}
        >
          {INSTITUTION_TYPES.map((i) => (
            <option key={i.id} value={i.id}>{i.label}</option>
          ))}
        </select>
      </div>

      {/* Área afectada */}
      <div className="water-field-group">
        <label>
          Personas afectadas
          <span className="water-optional"> (opcional)</span>
        </label>
        <div className="water-area-grid">
          {AFFECTS_PEOPLE.map((a) => (
            <label
              key={a.id}
              className={`water-area-option${values.affectsPeople === a.id ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="affectsPeople"
                value={a.id}
                checked={values.affectsPeople === a.id}
                onChange={handle('affectsPeople')}
              />
              {a.label}
            </label>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="water-field-group water-checkbox-group">
        <label className="water-checkbox-label">
          <input
            type="checkbox"
            checked={values.isRecurring ?? false}
            onChange={handle('isRecurring')}
          />
          <span>Este chorro ha presentado fallas antes</span>
        </label>
        <label className="water-checkbox-label">
          <input
            type="checkbox"
            checked={values.hasWaterLoss ?? false}
            onChange={handle('hasWaterLoss')}
          />
          <span>Hay pérdida visible de agua (derrame activo)</span>
        </label>
      </div>
    </div>
  )
}

export default WaterReportFields
