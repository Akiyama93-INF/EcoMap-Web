// components/PipelineReportFields.jsx — nuevo en Fase 4 (Tubería dañada)
// Campos extra opcionales para la categoría tuberia_danada.
// Props:
//   values   — objeto metadata del formData padre
//   onChange — función (field, value) => void

import React from 'react'
import '../styles/components/PipelineReportFields.css'

const PIPELINE_TYPES = [
  { id: '',            label: 'No lo sé'      },
  { id: 'agua_potable',label: 'Agua potable'  },
  { id: 'aguas_negras',label: 'Aguas negras'  },
  { id: 'aguas_lluvia',label: 'Aguas lluvias' },
  { id: 'desconocido', label: 'Desconocido'   },
]

const INSTITUTION_TYPES = [
  { id: '',         label: 'No lo sé / No aplica' },
  { id: 'ANDA',     label: 'ANDA'                 },
  { id: 'alcaldia', label: 'Alcaldía'             },
  { id: 'otro',     label: 'Otro'                 },
]

const SEVERITY_LEVELS = [
  { id: 'leve',    label: 'Leve'     },
  { id: 'moderado',label: 'Moderado' },
  { id: 'grave',   label: 'Grave'    },
]

function PipelineReportFields({ values = {}, onChange }) {
  const handle = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    onChange(field, val)
  }

  return (
    <div className="pipeline-fields">
      <div className="pipeline-fields-header">
        <span className="pipeline-fields-icon">🔧</span>
        <div>
          <p className="pipeline-fields-title">Detalles de la tubería</p>
          <p className="pipeline-fields-subtitle">Todos los campos son opcionales pero ayudan a agilizar la atención</p>
        </div>
      </div>

      {/* Tipo de tubería */}
      <div className="pipeline-field-group">
        <label htmlFor="pipelineType">
          Tipo de tubería
          <span className="pipeline-optional"> (opcional)</span>
        </label>
        <select
          id="pipelineType"
          value={values.pipelineType ?? ''}
          onChange={handle('pipelineType')}
        >
          {PIPELINE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Institución responsable */}
      <div className="pipeline-field-group">
        <label htmlFor="institutionType">
          Institución responsable
          <span className="pipeline-optional"> (opcional)</span>
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

      {/* Severidad */}
      <div className="pipeline-field-group">
        <label>
          Severidad del daño
          <span className="pipeline-optional"> (opcional)</span>
        </label>
        <div className="pipeline-severity-grid">
          {SEVERITY_LEVELS.map((s) => (
            <label
              key={s.id}
              className={`pipeline-severity-option pipeline-severity-${s.id}${values.severity === s.id ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="severity"
                value={s.id}
                checked={values.severity === s.id}
                onChange={handle('severity')}
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="pipeline-field-group pipeline-checkbox-group">
        <label className="pipeline-checkbox-label">
          <input
            type="checkbox"
            checked={values.affectsTraffic ?? false}
            onChange={handle('affectsTraffic')}
          />
          <span>Afecta el tráfico vehicular</span>
        </label>
        <label className="pipeline-checkbox-label">
          <input
            type="checkbox"
            checked={values.isRecurring ?? false}
            onChange={handle('isRecurring')}
          />
          <span>Ya había ocurrido antes en este lugar</span>
        </label>
      </div>
    </div>
  )
}

export default PipelineReportFields
