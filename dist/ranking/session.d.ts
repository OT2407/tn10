export interface SessionProfile {
    userId: string;
    viewedTags: Record<string, number>;
    viewedCategories: Record<string, number>;
    viewedDesigners: Record<string, number>;
}
export declare function getSession(userId: string): SessionProfile;
export declare function updateSession(userId: string, type: 'tag' | 'category' | 'designer', key: string): void;
//# sourceMappingURL=session.d.ts.map