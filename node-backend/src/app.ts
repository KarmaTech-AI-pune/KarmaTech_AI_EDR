import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { errorHandler, notFound } from './middleware/error';
import { seedProjects } from './models/Project';
import { seedUsers } from './models/User';

// Route imports
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import wbsRoutes from './routes/wbsRoutes';
import userRoutes from './routes/userRoutes';

// Load env vars
dotenv.config();

// Connect to database and seed data
connectDB().then(async () => {
  await seedUsers();
  await seedProjects();
});

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/wbs', wbsRoutes);
app.use('/api/user', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

export default app;
