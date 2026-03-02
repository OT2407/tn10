export declare function createContract(ownerId: string, title: string, body: string): Promise<{
    ownerId: string;
    id: string;
    title: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    escrowId: string | null;
    body: string;
}>;
export declare function attachEscrow(contractId: string, escrowId: string): Promise<{
    ownerId: string;
    id: string;
    title: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    escrowId: string | null;
    body: string;
}>;
export declare function completeContract(contractId: string): Promise<{
    ownerId: string;
    id: string;
    title: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    escrowId: string | null;
    body: string;
}>;
export declare function getContract(id: string): Promise<({
    escrow: ({
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
    }) | null;
} & {
    ownerId: string;
    id: string;
    title: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    escrowId: string | null;
    body: string;
}) | null>;
//# sourceMappingURL=contractService.d.ts.map