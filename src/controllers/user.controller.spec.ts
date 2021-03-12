import { Response } from 'express';

import { IAuthenticatedRequest } from '../middleware/jwt.guard.middleware';
import { IUserDocument } from '../models/user.model';
import userController from './user.controller';

jest.mock('../services/jwt.service');

describe('UserController', () => {
  const userLogoutSpy = jest.fn();
  const user = {
    _id: 'user-id',
    username: 'username',
    name: 'name',
    logout: userLogoutSpy,
  } as unknown as IUserDocument;

  let req: IAuthenticatedRequest;
  let res: Response;

  beforeEach(() => {
    req = {
      user,
    } as unknown as IAuthenticatedRequest;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getProfile', () => {
    it('should response with status 200 and and user info', async () => {

      await userController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });
  });

  describe('logout', () => {
    it('should response with status 200 and call user.logout', async () => {
      await userController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'You have been logged out successfully' });
      expect(userLogoutSpy).toHaveBeenCalled();
    });

    it('should response with status 500 when logout failed', async () => {
      const error = new Error('Timed out!');
      userLogoutSpy.mockRejectedValue(error);

      await userController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
      expect(userLogoutSpy).toHaveBeenCalled();
    });
  });
});
