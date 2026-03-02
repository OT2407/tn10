interface SaveMutationResult {
    created: boolean;
}
export declare function createSave(userId: string, itemId: string): Promise<SaveMutationResult>;
export declare function deleteSave(userId: string, itemId: string): Promise<void>;
export {};
//# sourceMappingURL=saveService.d.ts.map