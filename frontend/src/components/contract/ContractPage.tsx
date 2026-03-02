import React, { useMemo, useState } from 'react';
import type { ContractViewModel } from '../../types/domain';

type Tab = 'Overview' | 'Milestones' | 'Chat' | 'Files' | 'Activity Log';

interface ContractPageProps {
  contract: ContractViewModel;
}

export function ContractPage({ contract }: ContractPageProps) {
  const [tab, setTab] = useState<Tab>('Overview');
  const releasedPercent = useMemo(
    () => contract.milestones.filter((m) => m.status === 'RELEASED').reduce((sum, m) => sum + m.percentage, 0),
    [contract.milestones]
  );

  return (
    <section className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      {contract.monitoringEnabled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Monitoring Mode Enabled: escrow is active and activity is tracked.
        </div>
      )}

      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{contract.title}</h1>
        <span className="rounded bg-zinc-100 px-3 py-1 text-sm">Freeze: {contract.freezeState}</span>
      </header>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
        <div className="h-full bg-zinc-900 transition-all" style={{ width: `${releasedPercent}%` }} />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['Overview', 'Milestones', 'Chat', 'Files', 'Activity Log'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`rounded-full px-4 py-2 text-sm ${tab === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Milestones' && (
        <ul className="space-y-2 rounded-xl border border-zinc-200 p-4">
          {contract.milestones.map((m) => (
            <li key={m.id} className="flex justify-between text-sm"><span>{m.name}</span><span>{m.percentage}% · {m.status}</span></li>
          ))}
        </ul>
      )}

      {tab === 'Files' && <ul className="rounded-xl border border-zinc-200 p-4 text-sm">{contract.files.map((f) => <li key={f}>{f}</li>)}</ul>}
      {tab === 'Activity Log' && <ul className="rounded-xl border border-zinc-200 p-4 text-sm">{contract.activityLog.map((a) => <li key={a}>{a}</li>)}</ul>}
      {(tab === 'Overview' || tab === 'Chat') && <div className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-600">{tab} panel ready for live data binding.</div>}
    </section>
  );
}
