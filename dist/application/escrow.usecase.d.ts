export declare function holdFunds(transactionId: string): Promise<{
    amount: number;
    transactionId: string;
    id: string;
    createdAt: Date;
    status: string;
    releasedAt: Date | null;
}>;
export declare function releaseEscrow(transactionId: string): Promise<{
    amount: number;
    transactionId: string;
    id: string;
    createdAt: Date;
    status: string;
    releasedAt: Date | null;
}>;
export declare function addEscrowMilestone(transactionId: string, input: {
    name: string;
    percentage: number;
}): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    status: string;
    percentage: number;
    releasedAt: Date | null;
    escrowId: string;
}>;
export declare function releaseMilestone(milestoneId: string): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    status: string;
    percentage: number;
    releasedAt: Date | null;
    escrowId: string;
}>;
export declare function getEscrowDetailsByTransaction(transactionId: string): Promise<{
    milestones: {
        name: string;
        id: string;
        createdAt: Date;
        status: string;
        percentage: number;
        releasedAt: Date | null;
        escrowId: string;
    }[];
} & {
    amount: number;
    transactionId: string;
    id: string;
    createdAt: Date;
    status: string;
    releasedAt: Date | null;
}>;
//# sourceMappingURL=escrow.usecase.d.ts.map