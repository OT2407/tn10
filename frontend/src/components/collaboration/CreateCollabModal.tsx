import React, { useMemo, useState } from 'react';
import type { CollaborationMember } from '../../types/domain';
import { MemberInviteInput } from './MemberInviteInput';
import { RevenueSplitSlider } from './RevenueSplitSlider';

interface CreateCollabModalProps {
  open: boolean;
  members: CollaborationMember[];
}

export function CreateCollabModal({ open, members }: CreateCollabModalProps) {
  const [invite, setInvite] = useState('');
  const [localMembers, setLocalMembers] = useState(members);

  const total = useMemo(() => localMembers.reduce((sum, m) => sum + m.percentage, 0), [localMembers]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-zinc-900/35 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">Create Collaboration</h2>
        <p className="mt-1 text-sm text-zinc-600">Invite members and define revenue split.</p>
        <div className="mt-4 space-y-3">
          <MemberInviteInput value={invite} onChange={setInvite} />
          {localMembers.map((member, idx) => (
            <RevenueSplitSlider
              key={member.id}
              label={`${member.name} (${member.role})`}
              value={member.percentage}
              onChange={(value) => setLocalMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, percentage: value } : m)))}
            />
          ))}
          <p className={`text-sm ${total === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>Total Split: {total}%</p>
          <button type="button" className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white">Save Collaboration</button>
        </div>
      </div>
    </div>
  );
}
