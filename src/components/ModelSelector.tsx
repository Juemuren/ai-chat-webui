import React from 'react'
import './ModelSelector.css'

interface ModelSelectorProps {
  models: { name: string }[]
  model: string
  onChange: (model: string) => void
  loading?: boolean
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  model,
  onChange,
  loading,
}) => (
  <div className="model-selector-row">
    <label className="model-selector-label">选择模型</label>
    <select
      value={model}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading || models.length === 0}
      className="modern-select"
    >
      {models.map((m) => (
        <option key={m.name} value={m.name} className="model-selector-option">
          {m.name}
        </option>
      ))}
    </select>
  </div>
)
