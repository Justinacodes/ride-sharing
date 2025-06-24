'use client';

import ToggleSwitch from './Switch';
import { useState } from 'react';
import { FaFacebook, FaGoogle } from 'react-icons/fa';

interface Props {
  provider: 'Facebook' | 'Google';
  defaultChecked?: boolean;
}

export default function BindAccountToggle({ provider, defaultChecked = false }: Props) {
  const [enabled, setEnabled] = useState(defaultChecked);

  const icon = provider === 'Facebook' ? (
    <FaFacebook className="text-blue-600 h-5 w-5" />
  ) : (
    <FaGoogle className="text-red-500 h-5 w-5" />
  );

  return (
    <div className="flex justify-between items-center p-3 bg-gray-100 rounded-xl">
      <div className="flex items-center gap-3">
        {icon}
        <span>{provider}</span>
      </div>
      <ToggleSwitch checked={enabled} onChange={setEnabled} />
    </div>
  );
}
