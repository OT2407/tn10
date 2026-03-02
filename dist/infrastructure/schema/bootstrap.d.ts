export interface SchemaVerificationResult {
    ok: boolean;
    missingTables: string[];
    missingColumns: string[];
}
export declare function ensureSqliteSchema(): Promise<void>;
export declare function verifySqliteSchema(): Promise<SchemaVerificationResult>;
//# sourceMappingURL=bootstrap.d.ts.map