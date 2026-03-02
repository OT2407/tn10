/**
 * TN10 core domain contracts.
 * Domain-first and persistence-agnostic model definitions.
 */
export type TN10Id = string;
export type IsoDatetime = string;
/**
 * Validation-friendly currency code. Defaults can be applied in service layer.
 */
export type CurrencyCode = "TRY" | string;
export type OrderStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";
export type UserRole = "admin" | "customer";
/**
 * Item represents something that can be sold or managed.
 */
export interface Item {
    id: TN10Id;
    name: string;
    description: string;
    price: number;
    currency: CurrencyCode;
    stock: number;
    isActive: boolean;
    createdAt: IsoDatetime;
    updatedAt: IsoDatetime;
}
/**
 * Category groups items.
 */
export interface Category {
    id: TN10Id;
    name: string;
    description: string;
    items: Item[];
    createdAt: IsoDatetime;
    updatedAt: IsoDatetime;
}
/**
 * Customer contact and delivery info embedded in order domain payload.
 */
export interface CustomerInfo {
    name: string;
    phone: string;
    address: string;
}
/**
 * Line item inside an order.
 */
export interface OrderItem {
    id: TN10Id;
    itemId: TN10Id;
    quantity: number;
    price: number;
    total: number;
}
/**
 * Order represents a purchase.
 */
export interface Order {
    id: TN10Id;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    customer: CustomerInfo;
    createdAt: IsoDatetime;
    updatedAt: IsoDatetime;
}
/**
 * Optional initial-scope user model.
 */
export interface User {
    id: TN10Id;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: IsoDatetime;
}
//# sourceMappingURL=contracts.d.ts.map