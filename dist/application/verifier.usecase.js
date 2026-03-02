"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyArtifactChain = verifyArtifactChain;
const errors_1 = require("./errors");
const verifierService_1 = require("../services/verifierService");
async function verifyArtifactChain(itemId) {
    const data = await (0, verifierService_1.getItemWithFreezesForVerification)(itemId);
    if (!data) {
        throw new errors_1.AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }
    const checks = [];
    const hashes = new Set();
    let previousHash = null;
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
//# sourceMappingURL=verifier.usecase.js.map