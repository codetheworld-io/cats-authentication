import jsonwebtoken from 'jsonwebtoken';
import { mocked, MockedObject } from 'ts-jest/dist/utils/testing';
import jwtService, { IUserPayload } from './jwt.service';

jest.mock('jsonwebtoken');

describe('JwtService', () => {
  const secret = 'secret-string';
  const tokenLife = 'token-time-to-live';
  const payload: IUserPayload = {
    _id: 'id',
    username: 'username',
  };

  let jwt: MockedObject<typeof jsonwebtoken>;
  
  beforeEach(() => {
    jwt = mocked(jsonwebtoken);

    process.env.SECRET = secret;
    process.env.TOKEN_LIFE = tokenLife;
  });

  describe('sign', () => {
    it('should call jwt.sign function', () => {
      jwtService.sign(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, { expiresIn: tokenLife });
    });
  });

  describe('verify', () => {
    it('should call jwt.verify function', () => {
      const token = 'token';
      jwt.verify.mockReturnValue(payload as never);

      const result = jwtService.verify(token);
      
      expect(result).toEqual(payload);
      expect(jwt.verify).toHaveBeenCalledWith(token, secret);
    });
  });
});
