import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`switch-container ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        style={{ display: 'none' }}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={`switch-track ${checked ? 'active' : ''}`}>
        <div className="switch-thumb" />
      </div>
      {label && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>}
    </label>
  );
};
