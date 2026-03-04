import type { LayerBreakdown } from '../ranking/types';
export interface ExplorePageInput {
    userId: string;
    limit: number;
    cursor?: string;
    debugRanking?: boolean;
}
export interface ExploreScoredItem {
    itemId: string;
    score: number;
    title: string | null;
    category: string | null;
    sellerId: string | null;
    createdAt: Date;
    _ranking?: LayerBreakdown;
}
export interface ExplorePage {
    items: ExploreScoredItem[];
    nextCursor: string | null;
}
export declare function applyLikePreferenceBoost(userId: string, itemId: string): Promise<void>;
export declare function applySavePreferenceBoost(userId: string, itemId: string): Promise<void>;
export declare function applyFollowPreferenceBoost(userId: string, followingId: string): Promise<void>;
export declare function applyPurchasePreferenceBoost(userId: string, itemId: string): Promise<void>;
export declare function getRankedExplorePage(input: ExplorePageInput): Promise<ExplorePage>;
export declare function getExploreItemScoreBreakdown(userId: string, itemId: string): Promise<LayerBreakdown | null>;
//# sourceMappingURL=intelligenceService.d.ts.map