import React from 'react';

interface MemberInviteInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function MemberInviteInput({ value, onChange }: MemberInviteInputProps) {
  return (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Invite member by email"
      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
    />
  );
}
