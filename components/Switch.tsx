'use client';

import { useState } from 'react';

interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: (value: boolean) => void;
}

export default function ToggleSwitch({ checked = false, onChange }: ToggleSwitchProps) {
  const [enabled, setEnabled] = useState(checked);

  const toggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    onChange?.(newVal);
  };

  return (
    <button
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        enabled ? 'bg-purple-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
