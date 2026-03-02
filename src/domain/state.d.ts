import { OrderStatus } from "./contracts";
/**
 * Domain state machine for order lifecycle.
 */
export interface OrderTransition {
    from: OrderStatus;
    event: "pay" | "ship" | "complete" | "cancel";
    to: OrderStatus;
}
export declare const INITIAL_ORDER_STATUS: OrderStatus;
export declare const ORDER_TRANSITIONS: OrderTransition[];
/**
 * Validation-friendly event matrix used to check allowed transitions.
 */
export declare const ORDER_EVENT_MAP: Record<OrderStatus, Array<OrderTransition["event"]>>;
/**
 * Optional item activity state machine for listing lifecycle.
 */
export type ItemActivityState = "inactive" | "active";
export interface ItemTransition {
    from: ItemActivityState;
    event: "activate" | "deactivate";
    to: ItemActivityState;
}
export declare const ITEM_TRANSITIONS: ItemTransition[];
//# sourceMappingURL=state.d.ts.map