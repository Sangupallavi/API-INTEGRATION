// server.js
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authroutes.js';
import newsRoutes from './routes/newsroutes.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on the port ${PORT}`);
});
