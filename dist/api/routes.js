"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const item_schema_1 = require("../validation/item.schema");
const freeze_schema_1 = require("../validation/freeze.schema");
const order_schema_1 = require("../validation/order.schema");
const wallet_schema_1 = require("../validation/wallet.schema");
const auth_schema_1 = require("../validation/auth.schema");
const contracts_schema_1 = require("../validation/contracts.schema");
const explore_schema_1 = require("../validation/explore.schema");
const itemUsecase = __importStar(require("../application/item.usecase"));
const freezeUsecase = __importStar(require("../application/freeze.usecase"));
const contractsUsecase = __importStar(require("../application/contracts.usecase"));
const verifierUsecase = __importStar(require("../application/verifier.usecase"));
const orderUsecase = __importStar(require("../application/order.usecase"));
const walletUsecase = __importStar(require("../application/wallet.usecase"));
const validation_1 = require("./middleware/validation");
const auth_1 = require("./middleware/auth");
const errors_1 = require("../application/errors");
const env_1 = require("../infrastructure/env");
const userService_1 = require("../services/userService");
const intelligenceService_1 = require("../services/intelligenceService");
const likeService_1 = require("../services/likeService");
const saveService_1 = require("../services/saveService");
const followService_1 = require("../services/followService");
const router = express_1.default.Router();
const ItemIdParamsSchema = zod_1.z.object({ id: zod_1.z.string().min(1) });
const UserIdParamsSchema = zod_1.z.object({ id: zod_1.z.string().min(1) });
const PaginationQuerySchema = zod_1.z.object({
    cursor: zod_1.z.string().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
});
router.post('/auth/login', (0, validation_1.validate)({ body: auth_schema_1.LoginSchema }), async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const env = (0, env_1.getEnv)();
        if (username !== env.ADMIN_USER || password !== env.ADMIN_PASS) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Invalid credentials');
        }
        const user = await (0, userService_1.upsertUserByEmail)(env.ADMIN_USER, env.ADMIN_PASS, 'admin');
        const token = (0, auth_1.signAccessToken)(user.id);
        res.status(200).json({ success: true, data: { token } });
    }
    catch (err) {
        next(err);
    }
});
router.get('/contracts/schema', (_req, res) => {
    res.status(200).json({ success: true, data: contractsUsecase.getContractsSchema() });
});
router.post('/items/:id/like', auth_1.authMiddleware, (0, validation_1.validate)({ params: ItemIdParamsSchema }), async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const { id } = req.params;
        const result = await (0, likeService_1.createLike)(userId, id);
        res.status(result.created ? 201 : 200).json({ success: true, data: { liked: true } });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/items/:id/like', auth_1.authMiddleware, (0, validation_1.validate)({ params: ItemIdParamsSchema }), async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const { id } = req.params;
        await (0, likeService_1.deleteLike)(userId, id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
router.post('/items/:id/save', auth_1.authMiddleware, (0, validation_1.validate)({ params: ItemIdParamsSchema }), async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const { id } = req.params;
        const result = await (0, saveService_1.createSave)(userId, id);
        res.status(result.created ? 201 : 200).json({ success: true, data: { saved: true } });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/items/:id/save', auth_1.authMiddleware, (0, validation_1.validate)({ params: ItemIdParamsSchema }), async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const { id } = req.params;
        await (0, saveService_1.deleteSave)(userId, id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
router.post('/users/:id/follow', auth_1.authMiddleware, (0, validation_1.validate)({ params: UserIdParamsSchema }), async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const { id } = req.params;
        const result = await (0, followService_1.createFollow)(userId, id);
        res.status(result.created ? 201 : 200).json({ success: true, data: { following: true } });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/users/:id/follow', auth_1.authMiddleware, (0, validation_1.validate)({ params: UserIdParamsSchema }), async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const { id } = req.params;
        await (0, followService_1.deleteFollow)(userId, id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
router.get('/explore', auth_1.authMiddleware, (0, validation_1.validate)({ query: explore_schema_1.ExploreQuerySchema }), async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const query = explore_schema_1.ExploreQuerySchema.parse(req.query);
        const page = await (0, intelligenceService_1.getRankedExplorePage)({
            userId,
            limit: query.limit,
            ...(query.cursor === undefined ? {} : { cursor: query.cursor }),
        });
        res.status(200).json({ success: true, data: page });
    }
    catch (err) {
        next(err);
    }
});
router.get('/explore/:itemId/explain', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const itemId = req.params.itemId;
        if (typeof itemId !== 'string' || itemId.length === 0) {
            throw new errors_1.AppError(422, 'VALIDATION_ERROR', 'itemId is required');
        }
        const breakdown = await (0, intelligenceService_1.getExploreItemScoreBreakdown)(userId, itemId);
        if (!breakdown) {
            throw new errors_1.AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
        }
        res.status(200).json({ success: true, data: breakdown });
    }
    catch (err) {
        next(err);
    }
});
router.post('/items', auth_1.authMiddleware, (0, validation_1.validate)({ body: item_schema_1.CreateItemSchema }), async (req, res, next) => {
    try {
        const body = req.body;
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const item = await itemUsecase.createItem({
            ownerId: userId,
            ...(body.name === undefined ? {} : { name: body.name }),
        });
        res.status(201).json({ success: true, data: item });
    }
    catch (err) {
        next(err);
    }
});
router.get('/items', auth_1.authMiddleware, (0, validation_1.validate)({ query: PaginationQuerySchema }), async (req, res, next) => {
    try {
        const query = PaginationQuerySchema.parse(req.query);
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const page = await itemUsecase.getItemsPage({
            ownerId: userId,
            ...(query.cursor === undefined ? {} : { cursor: query.cursor }),
            limit: query.limit,
        });
        res.status(200).json({ success: true, data: page });
    }
    catch (err) {
        next(err);
    }
});
router.get('/items/:id', (0, validation_1.validate)({ params: ItemIdParamsSchema }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await itemUsecase.getItemWithFreezes(id);
        res.status(200).json({ success: true, data: item });
    }
    catch (err) {
        next(err);
    }
});
router.get('/items/:id/full', (0, validation_1.validate)({ params: ItemIdParamsSchema }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await itemUsecase.getItemFull(id);
        res.status(200).json({ success: true, data: item });
    }
    catch (err) {
        next(err);
    }
});
router.get('/items/:id/verify', (0, validation_1.validate)({ params: ItemIdParamsSchema }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const report = await verifierUsecase.verifyArtifactChain(id);
        res.status(200).json({ success: true, data: report });
    }
    catch (err) {
        next(err);
    }
});
router.get('/items/:id/freezes', (0, validation_1.validate)({ params: ItemIdParamsSchema, query: PaginationQuerySchema }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = PaginationQuerySchema.parse(req.query);
        const page = await freezeUsecase.getFreezesPage({
            itemId: id,
            ...(query.cursor === undefined ? {} : { cursor: query.cursor }),
            limit: query.limit,
        });
        res.status(200).json({ success: true, data: page });
    }
    catch (err) {
        next(err);
    }
});
router.post('/items/:id/freeze', auth_1.authMiddleware, (0, validation_1.validate)({ params: ItemIdParamsSchema, body: freeze_schema_1.CreateFreezeSchema }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const freeze = await freezeUsecase.freezeItem(id, req.body);
        res.status(201).json({ success: true, data: freeze });
    }
    catch (err) {
        next(err);
    }
});
router.post('/orders', auth_1.authMiddleware, (0, validation_1.validate)({ body: order_schema_1.CreateOrderSchema }), async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const body = req.body;
        const order = await orderUsecase.createOrder({
            buyerId: userId,
            sellerId: body.sellerId,
            itemId: body.itemId,
            amount: body.amount,
            ...(body.paymentWithWallet === undefined ? {} : { paymentWithWallet: body.paymentWithWallet }),
        });
        res.status(201).json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
});
router.post('/orders/:id/complete', auth_1.authMiddleware, (0, validation_1.validate)({ params: ItemIdParamsSchema }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await orderUsecase.completeOrder(id);
        res.status(200).json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
});
router.post('/orders/:id/cancel', auth_1.authMiddleware, (0, validation_1.validate)({ params: ItemIdParamsSchema }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await orderUsecase.cancelOrder(id);
        res.status(200).json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
});
router.post('/orders/:id/payment-intents', auth_1.authMiddleware, (0, validation_1.validate)({ params: ItemIdParamsSchema, body: order_schema_1.CreateOrderPaymentIntentSchema }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const intent = await orderUsecase.createOrderPaymentIntent(id, body.currency);
        res.status(201).json({ success: true, data: intent });
    }
    catch (err) {
        next(err);
    }
});
router.post('/contracts/escrow/transition', auth_1.authMiddleware, (0, validation_1.validate)({ body: contracts_schema_1.EscrowTransitionSchema }), (req, res, next) => {
    try {
        const body = req.body;
        const transition = contractsUsecase.transitionEscrowState(body);
        res.status(200).json({ success: true, data: transition });
    }
    catch (err) {
        next(err);
    }
});
router.post('/contracts/payment-intents', auth_1.authMiddleware, (0, validation_1.validate)({ body: contracts_schema_1.PaymentIntentPlaceholderSchema }), (req, res, next) => {
    try {
        const body = req.body;
        const paymentIntent = contractsUsecase.createPaymentIntentPlaceholder(body);
        res.status(201).json({ success: true, data: paymentIntent });
    }
    catch (err) {
        next(err);
    }
});
router.post('/wallet', auth_1.authMiddleware, async (_req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const wallet = await walletUsecase.createOwnerWallet(userId);
        res.status(201).json({ success: true, data: wallet });
    }
    catch (err) {
        next(err);
    }
});
router.get('/wallet', auth_1.authMiddleware, async (_req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const wallet = await walletUsecase.getWalletBalance(userId);
        res.status(200).json({ success: true, data: wallet });
    }
    catch (err) {
        next(err);
    }
});
router.get('/wallet/transactions', auth_1.authMiddleware, (0, validation_1.validate)({ query: wallet_schema_1.WalletTransactionsQuerySchema }), async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing user context');
        }
        const query = wallet_schema_1.WalletTransactionsQuerySchema.parse(req.query);
        const page = await walletUsecase.getWalletTransactionHistory(userId, query.limit, query.cursor);
        res.status(200).json({ success: true, data: page });
    }
    catch (err) {
        next(err);
    }
});
router.post('/wallet/adjust', auth_1.authMiddleware, (0, validation_1.validate)({ body: wallet_schema_1.WalletAdjustBodySchema }), async (req, res, next) => {
    try {
        const role = res.locals.userRole;
        if (role !== 'admin') {
            throw new errors_1.AppError(401, 'UNAUTHORIZED', 'Admin role required');
        }
        const body = req.body;
        const wallet = await walletUsecase.adminAdjustWallet(body.ownerId, body.amount, body.type, body.referenceId);
        res.status(200).json({ success: true, data: wallet });
    }
    catch (err) {
        next(err);
    }
});
router.get('/wallets/:userId/balance', auth_1.authMiddleware, (0, validation_1.validate)({ params: wallet_schema_1.WalletParamsSchema }), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const wallet = await walletUsecase.getWalletBalance(userId);
        res.status(200).json({ success: true, data: wallet });
    }
    catch (err) {
        next(err);
    }
});
router.get('/wallets/:userId/transactions', auth_1.authMiddleware, (0, validation_1.validate)({ params: wallet_schema_1.WalletParamsSchema, query: wallet_schema_1.WalletTransactionsQuerySchema }), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const query = wallet_schema_1.WalletTransactionsQuerySchema.parse(req.query);
        const transactions = await walletUsecase.getWalletTransactionHistory(userId, query.limit, query.cursor);
        res.status(200).json({ success: true, data: transactions });
    }
    catch (err) {
        next(err);
    }
});
router.post('/wallets/:userId/credit', auth_1.authMiddleware, (0, validation_1.validate)({ params: wallet_schema_1.WalletParamsSchema, body: wallet_schema_1.WalletCreditBodySchema }), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const body = req.body;
        const wallet = await walletUsecase.creditWalletBalance(userId, body.amount, body.reference);
        res.status(200).json({ success: true, data: wallet });
    }
    catch (err) {
        next(err);
    }
});
router.post('/wallets/:userId/debit', auth_1.authMiddleware, (0, validation_1.validate)({ params: wallet_schema_1.WalletParamsSchema, body: wallet_schema_1.WalletDebitBodySchema }), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const body = req.body;
        const wallet = await walletUsecase.debitWalletBalance(userId, body.amount, body.reference);
        res.status(200).json({ success: true, data: wallet });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map