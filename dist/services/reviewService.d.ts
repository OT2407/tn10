export declare function createReview(orderId: string, reviewerId: string, rating: number, comment: string): Promise<{
    itemId: string;
    id: string;
    createdAt: Date;
    orderId: string;
    reviewerId: string;
    rating: number;
    comment: string;
}>;
export declare function listItemReviews(itemId: string): Promise<{
    itemId: string;
    id: string;
    createdAt: Date;
    orderId: string;
    reviewerId: string;
    rating: number;
    comment: string;
}[]>;
//# sourceMappingURL=reviewService.d.ts.map