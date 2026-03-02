import { OrderStatus } from "./contracts";

/**
 * Domain state machine for order lifecycle.
 */
export interface OrderTransition {
  from: OrderStatus;
  event: "pay" | "ship" | "complete" | "cancel";
  to: OrderStatus;
}

export const INITIAL_ORDER_STATUS: OrderStatus = "pending";

export const ORDER_TRANSITIONS: OrderTransition[] = [
  { from: "pending", event: "pay", to: "paid" },
  { from: "pending", event: "cancel", to: "cancelled" },
  { from: "paid", event: "ship", to: "shipped" },
  { from: "paid", event: "cancel", to: "cancelled" },
  { from: "shipped", event: "complete", to: "completed" },
];

/**
 * Validation-friendly event matrix used to check allowed transitions.
 */
export const ORDER_EVENT_MAP: Record<OrderStatus, Array<OrderTransition["event"]>> = {
  pending: ["pay", "cancel"],
  paid: ["ship", "cancel"],
  shipped: ["complete"],
  completed: [],
  cancelled: [],
};

/**
 * Optional item activity state machine for listing lifecycle.
 */
export type ItemActivityState = "inactive" | "active";

export interface ItemTransition {
  from: ItemActivityState;
  event: "activate" | "deactivate";
  to: ItemActivityState;
}

export const ITEM_TRANSITIONS: ItemTransition[] = [
  { from: "inactive", event: "activate", to: "active" },
  { from: "active", event: "deactivate", to: "inactive" },
];
