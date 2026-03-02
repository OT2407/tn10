import { EscrowStatus } from './escrow.state';

export interface ItemRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>;
}

export interface TransactionRepository {
  findById(
    id: string
  ): Promise<{ id: string; itemId: string; buyerId: string; sellerId: string; amount: number; status: string } | null>;
}

export interface EscrowRepository {
  findByTransactionId(
    transactionId: string
  ): Promise<{ id: string; transactionId: string; amount: number; status: EscrowStatus } | null>;
}

export interface PaymentIntentRepository {
  createPlaceholder(input: {
    transactionId: string;
    amount: number;
    currency: string;
    requestId?: string;
  }): Promise<{
    id: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: 'requires_confirmation';
    provider: 'placeholder';
    createdAt: string;
  }>;
}
