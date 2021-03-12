import bcrypt from 'bcrypt';
import { Document, Model, Schema, model } from 'mongoose';

interface IUser {
  username: string;
  password: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  isPasswordValid(plainPassword: string): Promise<boolean>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IUserModel extends Model<IUserDocument> { }

const UserSchema = new Schema<IUserDocument, IUserModel>({
  username: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
  },
}, { timestamps: true });

UserSchema.pre('save', async function (this: IUserDocument) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

UserSchema.methods.isPasswordValid = async function (this: IUserDocument, plainPassword: string) {
  return bcrypt.compare(plainPassword, this.password);
};

UserSchema.set('toJSON', {
  transform: (_: unknown, result: { password?: string; __v?: number; }) => {
    delete result.password;
    delete result.__v;
    return result;
  },
});

export default model<IUserDocument, IUserModel>('User', UserSchema, 'users');
