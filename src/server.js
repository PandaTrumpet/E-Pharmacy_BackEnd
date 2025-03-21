import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { env } from './utils/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import router from './routers/index.js';
const app = express();
const PORT = Number(env('PORT', 3000));

export const startServer = () => {
  app.use(pino({ transport: { target: 'pino-pretty' } }));
  app.use(express.json());

  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(cookieParser());

  app.get('/', (req, res) => {
    res.json({ message: 'Hello  world' });
  });
  app.use(router);

  app.use('*', notFoundHandler);

  app.use(errorHandler);
  app.listen(PORT, () => {
    console.log(`Server is running in port ${PORT}`);
  });
};
