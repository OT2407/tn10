interface FollowMutationResult {
    created: boolean;
}
export declare function createFollow(followerId: string, followingId: string): Promise<FollowMutationResult>;
export declare function deleteFollow(followerId: string, followingId: string): Promise<void>;
export {};
//# sourceMappingURL=followService.d.ts.map