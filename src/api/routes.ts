import express from 'express';
import { z } from 'zod';
import { CreateItemSchema } from '../validation/item.schema';
import { CreateFreezeSchema } from '../validation/freeze.schema';
import { CreateOrderPaymentIntentSchema, CreateOrderSchema } from '../validation/order.schema';
import {
  WalletAdjustBodySchema,
  WalletBalanceQuerySchema,
  WalletCreditBodySchema,
  WalletDebitBodySchema,
  WalletParamsSchema,
  WalletTransactionsQuerySchema,
} from '../validation/wallet.schema';
import { LoginSchema } from '../validation/auth.schema';
import { EscrowTransitionSchema, PaymentIntentPlaceholderSchema } from '../validation/contracts.schema';
import { ExploreQuerySchema } from '../validation/explore.schema';
import * as itemUsecase from '../application/item.usecase';
import * as freezeUsecase from '../application/freeze.usecase';
import * as contractsUsecase from '../application/contracts.usecase';
import * as verifierUsecase from '../application/verifier.usecase';
import * as orderUsecase from '../application/order.usecase';
import * as walletUsecase from '../application/wallet.usecase';
import { validate } from './middleware/validation';
import { authMiddleware, signAccessToken } from './middleware/auth';
import { AppError } from '../application/errors';
import { getEnv } from '../infrastructure/env';
import { upsertUserByEmail } from '../services/userService';
import { getExploreItemScoreBreakdown, getRankedExplorePage } from '../services/intelligenceService';
import { createLike, deleteLike } from '../services/likeService';
import { createSave, deleteSave } from '../services/saveService';
import { createFollow, deleteFollow } from '../services/followService';

const router = express.Router();

const ItemIdParamsSchema = z.object({ id: z.string().min(1) });
const UserIdParamsSchema = z.object({ id: z.string().min(1) });
const PaginationQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

router.post('/auth/login', validate({ body: LoginSchema }), async (req, res, next) => {
  try {
    const { username, password } = req.body as z.infer<typeof LoginSchema>;
    const env = getEnv();

    if (username !== env.ADMIN_USER || password !== env.ADMIN_PASS) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    const user = await upsertUserByEmail(env.ADMIN_USER, env.ADMIN_PASS, 'admin');
    const token = signAccessToken(user.id);
    res.status(200).json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
});

router.get('/contracts/schema', (_req, res) => {
  res.status(200).json({ success: true, data: contractsUsecase.getContractsSchema() });
});

router.post('/items/:id/like', authMiddleware, validate({ params: ItemIdParamsSchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
    const result = await createLike(userId, id);
    res.status(result.created ? 201 : 200).json({ success: true, data: { liked: true } });
  } catch (err) {
    next(err);
  }
});

router.delete('/items/:id/like', authMiddleware, validate({ params: ItemIdParamsSchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
    await deleteLike(userId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post('/items/:id/save', authMiddleware, validate({ params: ItemIdParamsSchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
    const result = await createSave(userId, id);
    res.status(result.created ? 201 : 200).json({ success: true, data: { saved: true } });
  } catch (err) {
    next(err);
  }
});

router.delete('/items/:id/save', authMiddleware, validate({ params: ItemIdParamsSchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
    await deleteSave(userId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post('/users/:id/follow', authMiddleware, validate({ params: UserIdParamsSchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const { id } = req.params as z.infer<typeof UserIdParamsSchema>;
    const result = await createFollow(userId, id);
    res.status(result.created ? 201 : 200).json({ success: true, data: { following: true } });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id/follow', authMiddleware, validate({ params: UserIdParamsSchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const { id } = req.params as z.infer<typeof UserIdParamsSchema>;
    await deleteFollow(userId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get('/explore', authMiddleware, validate({ query: ExploreQuerySchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const query = ExploreQuerySchema.parse(req.query);
    const page = await getRankedExplorePage({
      userId,
      limit: query.limit,
      ...(query.debugRanking === undefined ? {} : { debugRanking: query.debugRanking }),
      ...(query.cursor === undefined ? {} : { cursor: query.cursor }),
    });
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
});

router.get('/feed', authMiddleware, validate({ query: ExploreQuerySchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const query = ExploreQuerySchema.parse(req.query);
    const page = await getRankedExplorePage({
      userId,
      limit: query.limit,
      ...(query.debugRanking === undefined ? {} : { debugRanking: query.debugRanking }),
      ...(query.cursor === undefined ? {} : { cursor: query.cursor }),
    });
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
});

router.get('/explore/:itemId/explain', authMiddleware, async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const itemId = req.params.itemId;
    if (typeof itemId !== 'string' || itemId.length === 0) {
      throw new AppError(422, 'VALIDATION_ERROR', 'itemId is required');
    }

    const breakdown = await getExploreItemScoreBreakdown(userId, itemId);
    if (!breakdown) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    res.status(200).json({
      success: true,
      data: {
        itemId,
        breakdown,
        diversityPenalty: breakdown.diversityPenalty ?? 0,
        totalScore: breakdown.totalScore,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/items', authMiddleware, validate({ body: CreateItemSchema }), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof CreateItemSchema>;
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const item = await itemUsecase.createItem({
      ownerId: userId,
      ...(body.name === undefined ? {} : { name: body.name }),
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.get('/items', authMiddleware, validate({ query: PaginationQuerySchema }), async (req, res, next) => {
  try {
    const query = PaginationQuerySchema.parse(req.query);
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const page = await itemUsecase.getItemsPage({
      ownerId: userId,
      ...(query.cursor === undefined ? {} : { cursor: query.cursor }),
      limit: query.limit,
    });
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
});

router.get('/items/:id', validate({ params: ItemIdParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
    const item = await itemUsecase.getItemWithFreezes(id);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.get('/items/:id/full', validate({ params: ItemIdParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
    const item = await itemUsecase.getItemFull(id);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.get('/items/:id/verify', validate({ params: ItemIdParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
    const report = await verifierUsecase.verifyArtifactChain(id);
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

router.get(
  '/items/:id/freezes',
  validate({ params: ItemIdParamsSchema, query: PaginationQuerySchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
      const query = PaginationQuerySchema.parse(req.query);
      const page = await freezeUsecase.getFreezesPage({
        itemId: id,
        ...(query.cursor === undefined ? {} : { cursor: query.cursor }),
        limit: query.limit,
      });
      res.status(200).json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/items/:id/freeze',
  authMiddleware,
  validate({ params: ItemIdParamsSchema, body: CreateFreezeSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
      const freeze = await freezeUsecase.freezeItem(id, req.body as z.infer<typeof CreateFreezeSchema>);
      res.status(201).json({ success: true, data: freeze });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/orders', authMiddleware, validate({ body: CreateOrderSchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }

    const body = req.body as z.infer<typeof CreateOrderSchema>;
    const order = await orderUsecase.createOrder({
      buyerId: userId,
      sellerId: body.sellerId,
      itemId: body.itemId,
      amount: body.amount,
      ...(body.paymentWithWallet === undefined ? {} : { paymentWithWallet: body.paymentWithWallet }),
    });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/complete', authMiddleware, validate({ params: ItemIdParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
    const order = await orderUsecase.completeOrder(id);
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/cancel', authMiddleware, validate({ params: ItemIdParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
    const order = await orderUsecase.cancelOrder(id);
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/orders/:id/payment-intents',
  authMiddleware,
  validate({ params: ItemIdParamsSchema, body: CreateOrderPaymentIntentSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params as z.infer<typeof ItemIdParamsSchema>;
      const body = req.body as z.infer<typeof CreateOrderPaymentIntentSchema>;
      const intent = await orderUsecase.createOrderPaymentIntent(id, body.currency);
      res.status(201).json({ success: true, data: intent });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/contracts/escrow/transition',
  authMiddleware,
  validate({ body: EscrowTransitionSchema }),
  (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof EscrowTransitionSchema>;
      const transition = contractsUsecase.transitionEscrowState(body);
      res.status(200).json({ success: true, data: transition });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/contracts/payment-intents',
  authMiddleware,
  validate({ body: PaymentIntentPlaceholderSchema }),
  (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof PaymentIntentPlaceholderSchema>;
      const paymentIntent = contractsUsecase.createPaymentIntentPlaceholder(body);
      res.status(201).json({ success: true, data: paymentIntent });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/wallet', authMiddleware, async (_req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const wallet = await walletUsecase.createOwnerWallet(userId);
    res.status(201).json({ success: true, data: wallet });
  } catch (err) {
    next(err);
  }
});

router.get('/wallet', authMiddleware, async (_req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const wallet = await walletUsecase.getWalletBalance(userId);
    res.status(200).json({ success: true, data: wallet });
  } catch (err) {
    next(err);
  }
});

router.get('/wallet/transactions', authMiddleware, validate({ query: WalletTransactionsQuerySchema }), async (req, res, next) => {
  try {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
    }
    const query = WalletTransactionsQuerySchema.parse(req.query);
    const page = await walletUsecase.getWalletTransactionHistory(userId, query.limit, query.cursor);
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
});

router.post('/wallet/adjust', authMiddleware, validate({ body: WalletAdjustBodySchema }), async (req, res, next) => {
  try {
    const role = res.locals.userRole as string | undefined;
    if (role !== 'admin') {
      throw new AppError(401, 'UNAUTHORIZED', 'Admin role required');
    }
    const body = req.body as z.infer<typeof WalletAdjustBodySchema>;
    const wallet = await walletUsecase.adminAdjustWallet(
      body.ownerId,
      body.amount,
      body.type,
      body.referenceId
    );
    res.status(200).json({ success: true, data: wallet });
  } catch (err) {
    next(err);
  }
});

router.get(
  '/wallets/:userId/balance',
  authMiddleware,
  validate({ params: WalletParamsSchema }),
  async (req, res, next) => {
    try {
      const { userId } = req.params as z.infer<typeof WalletParamsSchema>;
      const wallet = await walletUsecase.getWalletBalance(userId);
      res.status(200).json({ success: true, data: wallet });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/wallets/:userId/transactions',
  authMiddleware,
  validate({ params: WalletParamsSchema, query: WalletTransactionsQuerySchema }),
  async (req, res, next) => {
    try {
      const { userId } = req.params as z.infer<typeof WalletParamsSchema>;
      const query = WalletTransactionsQuerySchema.parse(req.query);
      const transactions = await walletUsecase.getWalletTransactionHistory(
        userId,
        query.limit,
        query.cursor
      );
      res.status(200).json({ success: true, data: transactions });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/wallets/:userId/credit',
  authMiddleware,
  validate({ params: WalletParamsSchema, body: WalletCreditBodySchema }),
  async (req, res, next) => {
    try {
      const { userId } = req.params as z.infer<typeof WalletParamsSchema>;
      const body = req.body as z.infer<typeof WalletCreditBodySchema>;
      const wallet = await walletUsecase.creditWalletBalance(userId, body.amount, body.reference);
      res.status(200).json({ success: true, data: wallet });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/wallets/:userId/debit',
  authMiddleware,
  validate({ params: WalletParamsSchema, body: WalletDebitBodySchema }),
  async (req, res, next) => {
    try {
      const { userId } = req.params as z.infer<typeof WalletParamsSchema>;
      const body = req.body as z.infer<typeof WalletDebitBodySchema>;
      const wallet = await walletUsecase.debitWalletBalance(userId, body.amount, body.reference);
      res.status(200).json({ success: true, data: wallet });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
