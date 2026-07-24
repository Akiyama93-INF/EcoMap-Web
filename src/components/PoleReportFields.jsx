// components/PoleReportFields.jsx — nuevo en Fase 4 (Poste de luz)
// Sección condicional de campos opcionales para la categoría poste_luz.
// Se monta dentro de ReportForm cuando selectedCat.id === 'poste_luz'.
// Props:
//   values   — objeto poleMetadata del formData padre
//   onChange — función (field, value) => void

import React from 'react'
import '../styles/components/PoleReportFields.css'

const FAULT_TYPES = [
  { id: 'lampara_apagada',  label: 'Lámpara apagada / fundida'   },
  { id: 'parpadeo',         label: 'Parpadeo intermitente'        },
  { id: 'poste_caido',      label: 'Poste caído o inclinado'      },
  { id: 'cables_expuestos', label: 'Cables expuestos o peligrosos'},
  { id: 'sin_lampara',      label: 'Sin lámpara (vandalismo)'     },
  { id: 'otro',             label: 'Otro'                         },
]

const ELECTRIC_COMPANIES = [
  { id: '',       label: 'No lo sé / No aplica' },
  { id: 'CAESS',  label: 'CAESS'                },
  { id: 'EEO',    label: 'EEO'                  },
  { id: 'CLESA',  label: 'CLESA'                },
  { id: 'B&D',    label: 'B&D'                  },
  { id: 'DEUSEM', label: 'DEUSEM'               },
]

const AFFECTS_AREA = [
  { id: 'solo_poste', label: 'Solo ese poste'  },
  { id: 'cuadra',     label: 'Una cuadra'      },
  { id: 'colonia',    label: 'Toda la colonia' },
]

function PoleReportFields({ values = {}, onChange }) {
  const handle = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    onChange(field, val)
  }

  return (
    <div className="pole-fields">
      <div className="pole-fields-header">
        <span className="pole-fields-icon">💡</span>
        <div>
          <p className="pole-fields-title">Detalles del poste</p>
          <p className="pole-fields-subtitle">Todos los campos son opcionales pero ayudan a agilizar la atención</p>
        </div>
      </div>

      {/* Número de poste */}
      <div className="pole-field-group">
        <label htmlFor="poleNumber">
          Número o código del poste
          <span className="pole-optional"> (opcional)</span>
        </label>
        <input
          id="poleNumber"
          type="text"
          placeholder="Ej: SV-0042 (visible en la placa del poste)"
          value={values.poleNumber ?? ''}
          onChange={handle('poleNumber')}
          maxLength={20}
        />
      </div>

      {/* Tipo de fallo */}
      <div className="pole-field-group">
        <label htmlFor="faultType">
          Tipo de fallo
          <span className="pole-optional"> (opcional)</span>
        </label>
        <select
          id="faultType"
          value={values.faultType ?? ''}
          onChange={handle('faultType')}
        >
          <option value="">Seleccionar...</option>
          {FAULT_TYPES.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>

        {/* Input adicional cuando faultType === 'otro' */}
        {values.faultType === 'otro' && (
          <input
            type="text"
            className="pole-other-input"
            placeholder="Describe brevemente el fallo..."
            value={values.faultTypeOther ?? ''}
            onChange={handle('faultTypeOther')}
            maxLength={80}
          />
        )}
      </div>

      {/* Compañía eléctrica */}
      <div className="pole-field-group">
        <label htmlFor="electricCompany">
          Compañía eléctrica
          <span className="pole-optional"> (opcional)</span>
        </label>
        <select
          id="electricCompany"
          value={values.electricCompany ?? ''}
          onChange={handle('electricCompany')}
        >
          {ELECTRIC_COMPANIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Área afectada */}
      <div className="pole-field-group">
        <label>
          Área afectada
          <span className="pole-optional"> (opcional)</span>
        </label>
        <div className="pole-area-grid">
          {AFFECTS_AREA.map((a) => (
            <label
              key={a.id}
              className={`pole-area-option${values.affectsArea === a.id ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="affectsArea"
                value={a.id}
                checked={values.affectsArea === a.id}
                onChange={handle('affectsArea')}
              />
              {a.label}
            </label>
          ))}
        </div>
      </div>

      {/* ¿Ha fallado antes? */}
      <div className="pole-field-group pole-checkbox-group">
        <label className="pole-checkbox-label">
          <input
            type="checkbox"
            checked={values.isRecurring ?? false}
            onChange={handle('isRecurring')}
          />
          <span>Este poste ha fallado antes en este lugar</span>
        </label>
      </div>
    </div>
  )
}

export default PoleReportFields
