import { Response } from 'express';
import { IAuthenticatedRequest } from '../middleware/jwt.guard.middleware';

class UserController {

  async getProfile(req: IAuthenticatedRequest, res: Response) {
    const { user } = req;
    return res.status(200).json(user);
  }

  async logout(req: IAuthenticatedRequest, res: Response) {
    try {
      const { user } = req;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await user!.logout();
      return res.status(200).json({ message: 'You have been logged out successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new UserController();
