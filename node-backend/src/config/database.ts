import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const CONNECTION_STRING = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    if(CONNECTION_STRING)
    {
    await mongoose.connect(CONNECTION_STRING);
    console.log('MongoDB connected successfully');
    }
    else throw('CONNECTION STRING NOT DEFINED')
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
