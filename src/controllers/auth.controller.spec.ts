import { Request, Response } from 'express';
import { MockedObject, mocked } from 'ts-jest/dist/utils/testing';
import userModel, { IUserDocument } from '../models/user.model';
import jwtService from '../services/jwt.service';
import authController from './auth.controller';

jest.mock('../services/jwt.service');
jest.mock('../models/user.model');

describe('AuthController', () => {
  const payload = {
    _id: 'user-id',
    username: 'username',
  };
  const user = {
    ...payload,
    isPasswordValid: async () => Promise.resolve(true),
  } as unknown as IUserDocument;

  let req: Request;
  let res: Response;
  let jwtServiceMock: MockedObject<typeof jwtService>;
  let userModelMock: MockedObject<typeof userModel>;

  beforeEach(() => {
    req = { } as unknown as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    jwtServiceMock = mocked(jwtService);

    userModelMock = mocked(userModel);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    const user = {
      ...payload,
    } as IUserDocument;
    const registerBody = {
      username: 'username',
      password: 'password',
      email: 'email@example.com',
      name: 'name',
    };

    beforeEach(() => {
      req.body = { ...registerBody };
    });

    it('should response with status 400 when username or email is existed', async () => {
      userModelMock.findOne.mockResolvedValue(user);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'username or email is existed' });
      expect(userModelMock.findOne)
        .toHaveBeenCalledWith({ $or: [{ username: registerBody.username }, { email: registerBody.email }] });
      expect(userModelMock.create).not.toHaveBeenCalled();
    });

    it('should response with status 201 when user be created', async () => {
      userModelMock.findOne.mockResolvedValue(null);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User is created ' });
      expect(userModelMock.findOne)
        .toHaveBeenCalledWith({ $or: [{ username: registerBody.username }, { email: registerBody.email }] });
      expect(userModelMock.create).toHaveBeenCalledWith(registerBody);
    });

    it('should response with status 500 when UserModel function throws error', async () => {
      userModelMock.findOne.mockResolvedValue(null);
      const error = new Error('Timed out!');
      userModelMock.create.mockRejectedValue(error as never);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
      expect(userModelMock.findOne)
        .toHaveBeenCalledWith({ $or: [{ username: registerBody.username }, { email: registerBody.email }] });
      expect(userModelMock.create).toHaveBeenCalledWith(registerBody);
    });
  });

  describe('login', () => {
    const loginBody = {
      username: 'username',
      password: 'password',
    };
    const token = 'token-string';

    beforeEach(() => {
      req.body = { ...loginBody };
    });

    it('should response with status 400 when username is not existed', async () => {
      userModelMock.findOne.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'username or password is invalid' });
      expect(userModelMock.findOne)
        .toHaveBeenCalledWith({ username: loginBody.username });
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('should response with status 400 when password is not valid', async () => {
      userModelMock.findOne.mockResolvedValue({
        isPasswordValid: async () => Promise.resolve(false),
      } as never);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'username or password is invalid' });
      expect(userModelMock.findOne)
        .toHaveBeenCalledWith({ username: loginBody.username });
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('should response with status 200 and token when username and password is valid', async () => {
      userModelMock.findOne.mockResolvedValue(user);
      jwtServiceMock.sign.mockReturnValue(token);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ accessToken: token });
      expect(userModelMock.findOne)
        .toHaveBeenCalledWith({ username: loginBody.username });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(payload);
    });

    it('should response with status 500 when jwtService.sign function throws error', async () => {
      const error = new Error('Token expired!');
      userModelMock.findOne.mockResolvedValue(user);
      jwtServiceMock.sign.mockImplementation(() => {
        throw error;
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
      expect(userModelMock.findOne)
        .toHaveBeenCalledWith({ username: loginBody.username });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(payload);
    });
  });
});
