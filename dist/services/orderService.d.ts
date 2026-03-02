export interface CreateOrderInput {
    buyerId: string;
    sellerId: string;
    itemId: string;
    amount: number;
}
export declare function createOrderRecord(input: CreateOrderInput): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
export declare function getOrderById(id: string): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
} | null>;
export declare function updateOrderStatus(id: string, status: 'pending' | 'completed' | 'cancelled'): Promise<{
    sellerId: string;
    itemId: string;
    amount: number;
    id: string;
    createdAt: Date;
    status: string;
    updatedAt: Date;
    buyerId: string;
}>;
//# sourceMappingURL=orderService.d.ts.map