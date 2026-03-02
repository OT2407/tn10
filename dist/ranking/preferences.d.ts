export interface UserPreference {
    userId: string;
    likedTags: Record<string, number>;
    likedCategories: Record<string, number>;
    followedDesigners: Record<string, number>;
}
export declare function getPreference(userId: string): UserPreference;
export declare function updatePreference(userId: string, type: 'tag' | 'category' | 'designer', key: string, delta: number): void;
//# sourceMappingURL=preferences.d.ts.map