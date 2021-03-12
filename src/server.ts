import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

import App from './app';


(async () => {
  await mongoose.connect(process.env.MONGO_URI as string, {
    serverSelectionTimeoutMS: 1000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  App.start(process.env.PORT);
})();
