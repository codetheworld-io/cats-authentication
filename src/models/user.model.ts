import bcrypt from 'bcrypt';
import { Document, Model, Schema, model } from 'mongoose';

interface IUser {
  username: string;
  password: string;
  email: string;
  name?: string;
  personalKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  isPasswordValid(plainPassword: string): Promise<boolean>;
  logout(): Promise<void>;
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
  personalKey: {
    type: String,
    required: true,
    unique: true,
    default: '-',
  },
}, { timestamps: true });

function genPersonalKey(): Promise<string> {
  return bcrypt.genSalt(6);
}

UserSchema.pre('save', async function (this: IUserDocument) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isNew) {
    this.personalKey = await genPersonalKey();
  }
});

UserSchema.methods.isPasswordValid = async function (this: IUserDocument, plainPassword: string) {
  return bcrypt.compare(plainPassword, this.password);
};

UserSchema.methods.logout = async function (this: IUserDocument) {
  this.personalKey = await genPersonalKey();
  await this.save();
};

UserSchema.set('toJSON', {
  transform: (_: unknown, result: { password?: string; __v?: number; personalKey?: string }) => {
    delete result.personalKey;
    delete result.password;
    delete result.__v;
    return result;
  },
});

export default model<IUserDocument, IUserModel>('User', UserSchema, 'users');
