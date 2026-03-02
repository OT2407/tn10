import { listFreezes } from '../services/freezeService';
import { CreateFreezeInput } from '../validation/freeze.schema';
export declare function freezeItem(itemId: string, input: CreateFreezeInput): Promise<{
    type: string;
    svg: string;
    metadata: string;
    parentHash: string | null;
    hash: string;
    id: string;
    createdAt: Date;
    itemId: string;
}>;
export { listFreezes };
//# sourceMappingURL=freeze.usecase.d.ts.map