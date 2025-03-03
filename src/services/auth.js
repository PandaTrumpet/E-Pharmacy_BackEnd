// import createHttpError from 'http-errors';
// import { randomBytes } from 'crypto';
// import { UserCollection } from '../db/models/user.js';
// import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
// import bcrypt from 'bcrypt';
// import { SessionsCollection } from '../db/models/session.js';
// import { env } from '../utils/env.js';

// const JWT_SECRET_ACCESS = env('JWT_SECRET_ACCESS');
// const JWT_SECRET_REFRESH = env('JWT_SECRET_REFRESH');

// export const registerUser = async (payload) => {
//   const user = await UserCollection.findOne({ email: payload.email });
//   if (user) throw createHttpError(409, 'Email in use!');
//   const encryptedPassword = await bcrypt.hash(payload.password, 10);
//   return await UserCollection.create({
//     ...payload,
//     password: encryptedPassword,
//   });
// };

// const createSession = async () => {
//   const accessToken = randomBytes(32).toString('base64');
//   const refreshToken = randomBytes(32).toString('base64');
//   return {
//     accessToken,
//     refreshToken,
//     accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
//     refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
//   };
// };

// export const loginUser = async (payload) => {
//   const user = await UserCollection.findOne({ email: payload.email });
//   if (!user) throw createHttpError(404, 'User not found!');
//   if (!user.password) throw createHttpError(401, 'User has no password set!z`');
//   const isPasswordValid = await bcrypt.compare(payload.password, user.password);
//   if (!isPasswordValid) throw createHttpError(401, 'Invalid  password!');
//   await SessionsCollection.deleteOne({ userId: user._id });

//   const accessToken = randomBytes(32).toString('base64');
//   const refreshToken = randomBytes(32).toString('base64');
//   return await SessionsCollection.create({
//     userId: user._id,
//     accessToken,
//     refreshToken,
//     accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
//     refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
//   });
// };

// export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
//   const session = await SessionsCollection.findOne({
//     _id: sessionId,
//     refreshToken,
//   });
//   // console.log(session);
//   if (!session) throw createHttpError(401, 'Session not found');

//   const isSessionTokenExpired =
//     new Date() > new Date(session.refreshTokenValidUntil);
//   if (isSessionTokenExpired) {
//     throw createHttpError(401, 'Session token expired');
//   }
//   const newSession = await createSession();
//   await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

//   return await SessionsCollection.create({
//     userId: session.userId,
//     ...newSession,
//   });
// };
// export const logoutUser = async (sessionId) => {
//   await SessionsCollection.deleteOne({ _id: sessionId });
// };

// export const getUserInfo = async (userId) => {
//   return await UserCollection.findById(userId);
// };

import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
import { env } from '../utils/env.js';

const JWT_SECRET_ACCESS = env('JWT_SECRET_ACCESS'); // Из .env
const JWT_SECRET_REFRESH = env('JWT_SECRET_REFRESH'); // Из .env

/**
 * Регистрирует пользователя
 */
export const registerUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use!');
  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return await UserCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

/**
 * Создаёт сессию, генерируя accessToken и refreshToken через JWT
 * @param {Object} user - Пользователь
 * @returns {Object} - Объект с токенами и сроками действия
 */
const createSession = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET_ACCESS,
    { expiresIn: '15m' },
  );
  const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET_REFRESH, {
    expiresIn: '1d',
  });

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

/**
 * Аутентифицирует пользователя и создаёт сессию
 */
export const loginUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });
  if (!user) throw createHttpError(404, 'User not found!');
  if (!user.password) throw createHttpError(401, 'User has no password set!');
  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) throw createHttpError(401, 'Invalid password!');

  // Удаляем старую сессию, если есть
  await SessionsCollection.deleteOne({ userId: user._id });

  const tokens = createSession(user);

  // Создаём новую сессию
  return await SessionsCollection.create({
    userId: user._id,
    ...tokens,
  });
};

/**
 * Обновляет сессию, используя refreshToken, и генерирует новые JWT
 */
export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  if (!sessionId || !refreshToken) {
    throw createHttpError(400, 'Session ID and refresh token are required');
  }

  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) throw createHttpError(401, 'Session not found');

  // Проверяем действительность refreshToken
  try {
    jwt.verify(refreshToken, JWT_SECRET_REFRESH);
  } catch (error) {
    console.log(error);
  }

  const newTokens = createSession({
    _id: session.userId,
    email: session.email,
  });
  // Удаляем старую сессию
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });
  // Создаём новую сессию с новыми токенами
  return await SessionsCollection.create({
    userId: session.userId,
    ...newTokens,
  });
};

/**
 * Завершает сессию пользователя (logout)
 */
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

/**
 * Возвращает информацию о пользователе по userId
 */
export const getUserInfo = async (userId) => {
  return await UserCollection.findById(userId);
};
