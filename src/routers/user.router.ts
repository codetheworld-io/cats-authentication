import { Router } from 'express';
import UserController from '../controllers/user.controller';
import JwtGuardMiddleware from '../middleware/jwt.guard.middleware';

class UserRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.use(JwtGuardMiddleware.getMiddleware());
    this.setup();
  }

  getRouter() {
    return this.router;
  }

  private setup() {
    this.router.get('/profile', async (req, res) => {
      await UserController.getProfile(req, res);
    });

    this.router.post('/logout', async (req, res) => {
      await UserController.logout(req, res);
    });
  }
}

export default new UserRouter();
