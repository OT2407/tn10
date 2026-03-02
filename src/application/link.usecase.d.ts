export interface LinkToFreezeInput {
    freezeId: string;
    url: string;
    note?: string;
}
export declare function linkToFreeze(input: LinkToFreezeInput): Promise<{
    id: string;
    url: string;
    note: string | null;
    freezeId: string;
}>;
//# sourceMappingURL=link.usecase.d.ts.map