export declare function createLink(freezeId: string, url: string, note?: string): Promise<{
    freezeId: string;
    url: string;
    note: string | null;
    id: string;
}>;
export declare function findLinkByFreezeAndUrl(freezeId: string, url: string): Promise<{
    freezeId: string;
    url: string;
    note: string | null;
    id: string;
} | null>;
//# sourceMappingURL=linkService.d.ts.map