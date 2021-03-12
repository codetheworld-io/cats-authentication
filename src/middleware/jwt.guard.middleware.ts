import { NextFunction, Request, Response } from 'express';
import userModel, { IUserDocument } from '../models/user.model';
import jwtService from '../services/jwt.service';

export interface IAuthenticatedRequest extends Request {
  user?: IUserDocument;
}

class JwtGuardMiddleware {
  getMiddleware() {
    return async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      try {
        const payload = jwtService.verify(token);
        const user = await userModel.findById(payload._id);
        if (!user) {
          throw new Error('User not found');
        }
        req.user = user;
        return next();
      } catch (error) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    };
  }
}

export default new JwtGuardMiddleware();
