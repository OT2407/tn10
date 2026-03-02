import React, { useState } from 'react';
import { ContractPage } from '../components/contract/ContractPage';
import { CreateCollabModal } from '../components/collaboration/CreateCollabModal';
import { sampleContract, sampleMembers } from '../mocks/data';

export function ContractScreen() {
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 pt-5">
        <button type="button" onClick={() => setShowModal(true)} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">Create Collaboration</button>
      </div>
      <ContractPage contract={sampleContract} />
      <CreateCollabModal open={showModal} members={sampleMembers} />
    </main>
  );
}
