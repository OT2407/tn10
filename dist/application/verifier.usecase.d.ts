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
export declare function verifyArtifactChain(itemId: string): Promise<ChainVerificationReport>;
export {};
//# sourceMappingURL=verifier.usecase.d.ts.map