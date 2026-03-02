export declare function createEscrow(transactionId: string, amount: number): Promise<{
    amount: number;
    transactionId: string;
    id: string;
    createdAt: Date;
    status: string;
    releasedAt: Date | null;
}>;
export declare function getEscrowByTransaction(transactionId: string): Promise<{
    amount: number;
    transactionId: string;
    id: string;
    createdAt: Date;
    status: string;
    releasedAt: Date | null;
} | null>;
export declare function releaseEscrow(id: string): Promise<{
    amount: number;
    transactionId: string;
    id: string;
    createdAt: Date;
    status: string;
    releasedAt: Date | null;
}>;
export declare function addMilestone(escrowId: string, name: string, percentage: number): Promise<{
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
export declare function getEscrowWithMilestones(id: string): Promise<{
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
//# sourceMappingURL=escrowService.d.ts.map