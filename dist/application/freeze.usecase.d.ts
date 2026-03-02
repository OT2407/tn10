import { listFreezes } from '../services/freezeService';
import { CreateFreezeInput } from '../validation/freeze.schema';
export declare function freezeItem(itemId: string, input: CreateFreezeInput): Promise<{
    type: string;
    svg: string;
    metadata: string;
    parentHash: string | null;
    hash: string;
    itemId: string;
    id: string;
    createdAt: Date;
}>;
export { listFreezes };
export interface ListFreezesInput {
    itemId: string;
    cursor?: string;
    limit: number;
}
export declare function getFreezesPage(input: ListFreezesInput): Promise<{
    freezes: {
        type: string;
        svg: string;
        metadata: string;
        parentHash: string | null;
        hash: string;
        itemId: string;
        id: string;
        createdAt: Date;
    }[];
    nextCursor: string | null;
}>;
//# sourceMappingURL=freeze.usecase.d.ts.map