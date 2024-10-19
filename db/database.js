import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB using environment variables
const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('MongoDB Connected');
	} catch (error) {
		console.error('Error connecting to MongoDB:', error);
		process.exit(1); // Exit process with failure
	}
};

export default connectDB;
