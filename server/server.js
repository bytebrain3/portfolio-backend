import jwt from "jsonwebtoken";
import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";


//local import
import authRouter from '../router/auth.router.js'
import projectRouter from '../router/projects.router.js' 
import blogRouter from '../router/blogPost.router.js'
import ConnectDataBase from '../db/database.js'
//env config
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 8000;


//init express appp
const app = express();

//use other dependence in express 
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/auth', blogRouter)
app.use('/api/v1/auth', projectRouter)

app.listen(PORT, () => {
  ConnectDataBase()
  console.log('Server is running on port',PORT);
});
