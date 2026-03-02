"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITEM_TRANSITIONS = exports.ORDER_EVENT_MAP = exports.ORDER_TRANSITIONS = exports.INITIAL_ORDER_STATUS = void 0;
exports.INITIAL_ORDER_STATUS = "pending";
exports.ORDER_TRANSITIONS = [
    { from: "pending", event: "pay", to: "paid" },
    { from: "pending", event: "cancel", to: "cancelled" },
    { from: "paid", event: "ship", to: "shipped" },
    { from: "paid", event: "cancel", to: "cancelled" },
    { from: "shipped", event: "complete", to: "completed" },
];
/**
 * Validation-friendly event matrix used to check allowed transitions.
 */
exports.ORDER_EVENT_MAP = {
    pending: ["pay", "cancel"],
    paid: ["ship", "cancel"],
    shipped: ["complete"],
    completed: [],
    cancelled: [],
};
exports.ITEM_TRANSITIONS = [
    { from: "inactive", event: "activate", to: "active" },
    { from: "active", event: "deactivate", to: "inactive" },
];
//# sourceMappingURL=state.js.map