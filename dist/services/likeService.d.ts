interface LikeMutationResult {
    created: boolean;
}
export declare function createLike(userId: string, itemId: string): Promise<LikeMutationResult>;
export declare function deleteLike(userId: string, itemId: string): Promise<void>;
export {};
//# sourceMappingURL=likeService.d.ts.map