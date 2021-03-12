import jwt from 'jsonwebtoken';

export interface IUserPayload {
  _id: string;
  username: string;
}

class JwtService {
  /**
   * @throws JsonWebTokenError
   */
  sign(payload: IUserPayload, personalKey: string): string {
    return jwt.sign(
      payload,
      this.createSecretString(personalKey),
      { expiresIn: process.env.TOKEN_LIFE },
    ) as string;
  }

  /**
   * @throws JsonWebTokenError
   */
  verify(token: string, personalKey: string): IUserPayload {
    return jwt.verify(token, this.createSecretString(personalKey)) as unknown as IUserPayload;
  }

  decodePayload(token: string): IUserPayload {
    return jwt.decode(token) as unknown as IUserPayload;
  }

  private createSecretString(personalKey: string): string {
    return `${process.env.SECRET}${personalKey}`;
  }
}

export default new JwtService();
