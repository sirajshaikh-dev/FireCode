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
<<<<<<< HEAD

console.log("Judge0 URL:", process.env.JUDGE0_API_URL);
console.log("Judge0 Key:", process.env.JUDGE0_API_KEY ? "Loaded ✅" : "Missing ❌");


//  Check Judge0 connection
// import axios from "axios";
// const res = await axios.get(`${process.env.JUDGE0_API_URL}/language`, {
//   headers: { "Authorization": `Bearer ${process.env.JUDGE0_API_KEY}` }
// });
// console.log("Languages:", res.data);

=======
>>>>>>> a6a53c4335255a174d787f083c64ff0b7c9f50d8

const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: [
<<<<<<< HEAD
      "https://www.firecode.in",
      "https://leetlab-liard.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
=======
      "http://localhost:5173",
      "http://localhost:5174",
      "https://www.firecode.in",
      "https://firecode.onrender.com",
      ],
>>>>>>> a6a53c4335255a174d787f083c64ff0b7c9f50d8
    credentials: true
  })
)

app.get('/', (req, res) => {
  res.send('welcome to leetlab')
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/problems', problemRoutes)
app.use('/api/v1/execute-code', executionRoute)
app.use('/api/v1/submission', submissionRoutes)
app.use('/api/v1/playlist', playlistRoutes)

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
