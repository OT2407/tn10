export interface ExplorePageInput {
    userId: string;
    limit: number;
    cursor?: string;
}
export interface ExploreScoredItem {
    itemId: string;
    score: number;
    title: string | null;
    category: string | null;
    sellerId: string | null;
    createdAt: Date;
}
export interface ExplorePage {
    items: ExploreScoredItem[];
    nextCursor: string | null;
}
export interface ExploreScoreBreakdown {
    personalizationLayer: number;
    engagementQualityLayer: number;
    freshnessLayer: number;
    creatorGrowthLayer: number;
    explorationNoise: number;
    totalScore: number;
    tagWeight: number;
    categoryWeight: number;
    designerWeight: number;
    trendingScore: number;
    recencyWeight: number;
}
export declare function applyLikePreferenceBoost(userId: string, itemId: string): Promise<void>;
export declare function applySavePreferenceBoost(userId: string, itemId: string): Promise<void>;
export declare function applyFollowPreferenceBoost(userId: string, followingId: string): Promise<void>;
export declare function applyPurchasePreferenceBoost(userId: string, itemId: string): Promise<void>;
export declare function getRankedExplorePage(input: ExplorePageInput): Promise<ExplorePage>;
export declare function getExploreItemScoreBreakdown(userId: string, itemId: string): Promise<ExploreScoreBreakdown | null>;
//# sourceMappingURL=intelligenceService.d.ts.map