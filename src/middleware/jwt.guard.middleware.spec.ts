import { NextFunction, RequestHandler, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { mocked, MockedObject } from 'ts-jest/dist/utils/testing';
import userModel, { IUserDocument } from '../models/user.model';

import jwtService, { IUserPayload } from '../services/jwt.service';
import jwtGuardMiddleware, { IAuthenticatedRequest } from './jwt.guard.middleware';

jest.mock('../services/jwt.service');
jest.mock('../models/user.model');

describe('JwtGuardMiddleware', () => {
  const token = 'token-string';
  const userPayload: IUserPayload = {
    _id: 'user-id',
    username: 'username',
  };
  const personalKey = 'personal-key';
  const user = {
    ...userPayload,
    name: 'name',
    personalKey,
   } as unknown as IUserDocument;

  let middleware: RequestHandler;
  let req: IAuthenticatedRequest;
  let res: Response;
  let next: NextFunction;
  let jwtServiceMock: MockedObject<typeof jwtService>;
  let userModelMock: MockedObject<typeof userModel>;

  beforeEach(() => {
    req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as IAuthenticatedRequest;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    next = jest.fn();

    jwtServiceMock = mocked(jwtService);
    userModelMock = mocked(userModel);

    middleware = jwtGuardMiddleware.getMiddleware();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });


  it('should response with status 401 when authorization is not provided', async () => {
    req.headers.authorization = undefined;

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
    expect(jwtServiceMock.decodePayload).not.toHaveBeenCalled();
    expect(userModelMock.findById).not.toHaveBeenCalled();
    expect(jwtServiceMock.verify).not.toHaveBeenCalled();
  });

  it('should response with status 403 when token is not valid', async () => {
    userModelMock.findById.mockResolvedValue(user);
    jwtServiceMock.decodePayload.mockReturnValue(userPayload);
    jwtServiceMock.verify.mockImplementation(() => {
      throw new JsonWebTokenError('Token is not valid');
    });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access token is invalid' });
    expect(next).not.toHaveBeenCalled();
    expect(jwtServiceMock.decodePayload).toHaveBeenCalledWith(token);
    expect(userModelMock.findById).toHaveBeenCalledWith(userPayload._id);
    expect(jwtServiceMock.verify).toHaveBeenCalledWith(token, personalKey);
  });

  it('should response with status 403 when user not found', async () => {
    userModelMock.findById.mockResolvedValue(null);
    jwtServiceMock.decodePayload.mockReturnValue(userPayload);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
    expect(jwtServiceMock.decodePayload).toHaveBeenCalledWith(token);
    expect(userModelMock.findById).toHaveBeenCalledWith(userPayload._id);
    expect(jwtServiceMock.verify).not.toHaveBeenCalled();
  });

  it('should call next and set user to req object when token is valid', async () => {
    userModelMock.findById.mockResolvedValue(user);
    jwtServiceMock.decodePayload.mockReturnValue(userPayload);
    jwtServiceMock.verify.mockReturnValue(userPayload);

    await middleware(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(user);
    expect(jwtServiceMock.decodePayload).toHaveBeenCalledWith(token);
    expect(userModelMock.findById).toHaveBeenCalledWith(userPayload._id);
    expect(jwtServiceMock.verify).toHaveBeenCalledWith(token, personalKey);
  });
});
