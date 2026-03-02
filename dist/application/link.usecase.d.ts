export interface LinkToFreezeInput {
    freezeId: string;
    url: string;
    note?: string;
}
export declare function linkToFreeze(input: LinkToFreezeInput): Promise<{
    freezeId: string;
    url: string;
    note: string | null;
    id: string;
}>;
//# sourceMappingURL=link.usecase.d.ts.map