import { Response } from 'express';
import { IAuthenticatedRequest } from '../middleware/jwt.guard.middleware';

class UserController {

  async getProfile(req: IAuthenticatedRequest, res: Response) {
    const { user } = req;
    return res.status(200).json(user);
  }

  async logout(req: IAuthenticatedRequest, res: Response) {
    return res.status(200).json({ message: 'You have been logged out successfully' });
  }
}

export default new UserController();
