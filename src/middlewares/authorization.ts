import { Request, Response, NextFunction } from 'express';

export function needAuthorization(req: Request, res: Response, next: NextFunction) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'unauthorized' });
    }
    next();
}
