import { AppError } from './errors';
import { getItemWithFreezesForVerification } from '../services/verifierService';

interface VerificationCheck {
  code: string;
  ok: boolean;
  message: string;
}

export interface ChainVerificationReport {
  itemId: string;
  isValid: boolean;
  freezeCount: number;
  currentHash: string | null;
  latestHash: string | null;
  checks: VerificationCheck[];
}

export async function verifyArtifactChain(itemId: string): Promise<ChainVerificationReport> {
  const data = await getItemWithFreezesForVerification(itemId);
  if (!data) {
    throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
  }

  const checks: VerificationCheck[] = [];
  const hashes = new Set<string>();

  let previousHash: string | null = null;
  let chainIsValid = true;

  for (const [index, freeze] of data.freezes.entries()) {
    const expectedParent = index === 0 ? null : previousHash;
    const parentOk = freeze.parentHash === expectedParent;
    checks.push({
      code: `PARENT_HASH_${index}`,
      ok: parentOk,
      message: parentOk ? 'Parent hash matches' : 'Parent hash mismatch in chain',
    });
    if (!parentOk) {
      chainIsValid = false;
    }

    const uniqueHash = !hashes.has(freeze.hash);
    checks.push({
      code: `UNIQUE_HASH_${index}`,
      ok: uniqueHash,
      message: uniqueHash ? 'Hash is unique' : 'Duplicate hash detected in chain',
    });
    if (!uniqueHash) {
      chainIsValid = false;
    }
    hashes.add(freeze.hash);
    previousHash = freeze.hash;
  }

  const latestHash = data.freezes.length > 0 ? data.freezes[data.freezes.length - 1]?.hash ?? null : null;
  const currentHashOk = data.item.currentHash === latestHash;
  checks.push({
    code: 'ITEM_CURRENT_HASH',
    ok: currentHashOk,
    message: currentHashOk ? 'Item currentHash matches latest freeze hash' : 'Item currentHash mismatch',
  });

  if (!currentHashOk) {
    chainIsValid = false;
  }

  return {
    itemId,
    isValid: chainIsValid,
    freezeCount: data.freezes.length,
    currentHash: data.item.currentHash,
    latestHash,
    checks,
  };
}
