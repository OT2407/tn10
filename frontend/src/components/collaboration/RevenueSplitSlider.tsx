import React from 'react';

interface RevenueSplitSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function RevenueSplitSlider({ label, value, onChange }: RevenueSplitSliderProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-700">{label} · {value}%</span>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}
