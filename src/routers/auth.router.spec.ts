import express, { Application } from 'express';
import { MockedObject, mocked } from 'ts-jest/dist/utils/testing';
import supertest from 'supertest';

import AuthRouter from './auth.router';
import authController from '../controllers/auth.controller';

jest.mock('../controllers/auth.controller');

describe('AuthRouter', () => {
  const expectedResponse = expect.anything();

  let app: Application;
  let request: supertest.SuperTest<supertest.Test>;
  let controller: MockedObject<typeof authController>;

  beforeEach(() => {
    controller = mocked(authController);
    controller.register.mockImplementation(async (_, res) => {
      return res.json({});
    });
    controller.login.mockImplementation(async (_, res) => {
      return res.json({});
    });

    app = express();
    app.use(express.json());
    app.use('/', AuthRouter.getRouter());
    request = supertest(app);
  });

  it('should call authController.register function when POST /register', async () => {
    const body = { username: 'username', password: 'password' };
    await request
      .post('/register')
      .send(body);

    expect(controller.register)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          body,
        }),
        expectedResponse,
      );
  });

  it('should call authController.login function when POST /login', async () => {
    const body = { username: 'username', password: 'password' };
    await request
      .post('/login')
      .send(body);

    expect(controller.login)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          body,
        }),
        expectedResponse,
      );
  });
});
