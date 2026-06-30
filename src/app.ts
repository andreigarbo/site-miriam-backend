import { config } from 'dotenv';
import helmet from 'helmet';
import express from 'express';
import analyticsRoutes from './routes/analytics.js';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import { errorHandler } from './errors/handler.js';

const app = express();

app.use(express.json());

app.use('/analytics', analyticsRoutes);

app.use('/users', usersRoutes);

app.use('/auth', authRoutes);

app.use(errorHandler);

app.use(helmet());

export default app;
