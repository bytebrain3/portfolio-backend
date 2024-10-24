import jwt from "jsonwebtoken";
import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

// Local imports
import authRouter from '../router/auth.router.js'
import projectRouter from '../router/projects.router.js' 
import blogRouter from '../router/blogPost.router.js'
import ConnectDataBase from '../db/database.js'

// Environment configuration
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 8000;

// Initialize express app
const app = express();

// CORS options
const corsOptions = {
  origin: [
    'http://localhost:5173', // Localhost
    'https://dip-mondal.vercel.app' // Your Vercel domain
  ],
  credentials: true, // Allow credentials such as cookies, headers
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
};

// Use middleware
app.use(cors(corsOptions)); // Enable CORS with specific domains
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true);

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/projects', projectRouter);

// Start the server
app.listen(PORT, () => {
  ConnectDataBase();
  console.log('Server is running on port', PORT);
});
