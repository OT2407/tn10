import { CreateItemInput } from '../validation/item.schema';
export declare function createItem(input: CreateItemInput): Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    currentHash: string | null;
}>;
export declare function getItemWithFreezes(id: string): Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    currentHash: string | null;
} | null>;
//# sourceMappingURL=item.usecase.d.ts.map