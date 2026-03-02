import { NextFunction, Request, Response } from 'express';
export declare function signAccessToken(userId: string): string;
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map