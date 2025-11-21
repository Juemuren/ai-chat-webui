import React from 'react'

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
  <div style={{ marginBottom: 12 }}>
    <label style={{ fontSize: 14, marginRight: 8 }}>选择模型：</label>
    <select
      value={model}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading || models.length === 0}
      style={{ padding: '4px 8px', fontSize: 14 }}
    >
      {models.map((m) => (
        <option key={m.name} value={m.name}>
          {m.name}
        </option>
      ))}
    </select>
  </div>
)
