import { Router } from 'express';
import AuthController from '../controllers/auth.controller';

class AuthRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.setup();
  }

  getRouter() {
    return this.router;
  }

  private setup() {
    this.router.post('/register', async (req, res) => {
      await AuthController.register(req, res);
    });

    this.router.post('/login', async (req, res) => {
      await AuthController.login(req, res);
    });
  }
}

export default new AuthRouter();
