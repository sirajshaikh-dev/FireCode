//index.js
import express from 'express';
import dotenv from 'dotenv';    
import cookieParser from 'cookie-parser'
import cors from 'cors'

import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import executionRoute from './routes/executeCode.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import playlistRoutes from './routes/playlist.routes.js';

dotenv.config(); 

const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin:["http://localhost:5173", "https://leetlab-two.vercel.app", "https://leetlab-liard.vercel.app" ,"https://www.firecode.in"],
    credentials:true
  })
)

app.get('/',(req,res)=>{
    res.send('welcome to leetlab')
})

app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/problems',problemRoutes)
app.use('/api/v1/execute-code',executionRoute)
app.use('/api/v1/submission',submissionRoutes)
app.use('/api/v1/playlist', playlistRoutes)

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
