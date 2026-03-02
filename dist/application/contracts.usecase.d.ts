import { EscrowEvent, EscrowStatus } from '../domain/escrow.state';
import { PaymentIntentPlaceholderInput } from '../validation/contracts.schema';
export declare function getContractsSchema(): {
    escrowTransition: {
        currentStatus: string[];
        event: string[];
    };
    paymentIntentPlaceholder: {
        transactionId: string;
        amount: string;
        currency: string;
        requestId: string;
    };
};
export declare function transitionEscrowState(input: {
    currentStatus: EscrowStatus;
    event: EscrowEvent;
}): {
    from: EscrowStatus;
    event: EscrowEvent;
    to: EscrowStatus;
};
export declare function createPaymentIntentPlaceholder(input: PaymentIntentPlaceholderInput): {
    requestId?: string;
    id: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: "requires_confirmation";
    provider: "placeholder";
    createdAt: string;
};
//# sourceMappingURL=contracts.usecase.d.ts.map