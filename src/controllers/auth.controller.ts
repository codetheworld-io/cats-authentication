import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import jwtService from '../services/jwt.service';

class AuthController {

  async register(req: Request, res: Response) {
    try {
      const { username, password, email, name } = req.body;

      const foundUser = await UserModel.findOne({ $or: [{ username }, { email }] });
      if (foundUser) {
        return res.status(400).json({ message: 'username or email is existed' });
      }
      await UserModel.create({
        username,
        password,
        email,
        name,
      });
      return res.status(201).json({ message: 'User is created ' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const foundUser = await UserModel.findOne({ username });
      if (!foundUser || !(await foundUser.isPasswordValid(password))) {
        return res.status(400).json({ message: 'username or password is invalid' });
      }

      return res.status(200).json({
        accessToken: jwtService.sign({ _id: foundUser._id, username: foundUser.username }),
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new AuthController();
