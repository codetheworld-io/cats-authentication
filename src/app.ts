import express, { Application } from 'express';
import AuthRouter from './routers/auth.router';
import UserRouter from './routers/user.router';

class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupGlobalMiddleware();
    this.setupRouters();
  }

  start(port: string | number = 3000) {
    return this.app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`listening on :${port}`);
    });
  }

  private setupGlobalMiddleware() {
    this.app.use(express.json());
  }

  private setupRouters() {
    this.app.get('/', (_, res) => {
      res.json({ message: 'Welcome to our service!' });
    });

    this.app.use('/api/v1/auth', AuthRouter.getRouter());
    this.app.use('/api/v1/users', UserRouter.getRouter());
  }
}

export default new App();
