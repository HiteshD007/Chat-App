import mongoose from 'mongoose';

const connectToDb = async () => {
  try {

    await mongoose.connect(process.env.DB_URL!);
    console.log('Connected to MongoDB Successfully');
    
  } catch (error:any) {
    console.log("ERROR IN CONNECTING TO MONGODB",error.message);
    
  }
}

export default connectToDb;