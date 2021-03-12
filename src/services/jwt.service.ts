import jwt from 'jsonwebtoken';

export interface IUserPayload {
  _id: string;
  username: string;
}

class JwtService {
  /**
   * @throws JsonWebTokenError
   */
  sign(payload: IUserPayload): string {
    return jwt.sign(
      payload,
      process.env.SECRET as string,
      { expiresIn: process.env.TOKEN_LIFE },
    ) as string;
  }

  /**
   * @throws JsonWebTokenError
   */
  verify(token: string): IUserPayload {
    return jwt.verify(token, process.env.SECRET as string) as unknown as IUserPayload;
  }
}

export default new JwtService();
