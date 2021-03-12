import express, { Application, NextFunction } from 'express';
import { MockedObject, mocked } from 'ts-jest/dist/utils/testing';
import supertest from 'supertest';

import userRouter from './user.router';
import userController from '../controllers/user.controller';
import jwtGuardMiddleware, { IAuthenticatedRequest } from '../middleware/jwt.guard.middleware';
import { IUserDocument } from '../models/user.model';

const user = {
  _id: 'user-id',
  username: 'username',
} as unknown as IUserDocument;

jest.mock('../controllers/user.controller');
jest.mock('../middleware/jwt.guard.middleware', () => ({
  getMiddleware: jest.fn(() => {
    return async (request: IAuthenticatedRequest, res: unknown, next: NextFunction) => {
      request.user = user;
      return next();
    };
  }),
}));

describe('UserRouter', () => {
  const expectedResponse = expect.anything();

  let app: Application;
  let request: supertest.SuperTest<supertest.Test>;
  let controller: MockedObject<typeof userController>;
  let jwtGuardMiddlewareMock: MockedObject<typeof jwtGuardMiddleware>;

  beforeEach(() => {
    controller = mocked(userController);
    controller.getProfile.mockImplementation(async (_, res) => {
      return res.json({});
    });
    controller.logout.mockImplementation(async (_, res) => {
      return res.json({});
    });

    jwtGuardMiddlewareMock = mocked(jwtGuardMiddleware);


    app = express();
    app.use(express.json());
    app.use('/', userRouter.getRouter());

    request = supertest(app);
  });

  it('should call userController.getProfile function when GET /profile', async () => {
    await request
      .get('/profile');

    expect(controller.getProfile)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          user: user,
        }),
        expectedResponse,
      );
    expect(jwtGuardMiddlewareMock.getMiddleware).toHaveBeenCalled();
  });

  it('should call userController.logout function when GET /logout', async () => {
    await request
      .post('/logout');

    expect(controller.logout)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          user: user,
        }),
        expectedResponse,
      );
    expect(jwtGuardMiddlewareMock.getMiddleware).toHaveBeenCalled();
  });
});
