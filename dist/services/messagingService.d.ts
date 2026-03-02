export declare function ensureContractConversation(contractId: string): Promise<{
    id: string;
    createdAt: Date;
    contractId: string;
    monitoringEnabled: boolean;
}>;
export declare function sendMessage(conversationId: string, senderId: string, content: string): Promise<{
    id: string;
    createdAt: Date;
    content: string;
    conversationId: string;
    senderId: string;
}>;
export declare function listMessages(conversationId: string): Promise<{
    id: string;
    createdAt: Date;
    content: string;
    conversationId: string;
    senderId: string;
}[]>;
//# sourceMappingURL=messagingService.d.ts.map