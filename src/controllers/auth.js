// import createHttpError from 'http-errors';
// import { ONE_DAY } from '../constants/index.js';
// import {
//   getUserInfo,
//   loginUser,
//   logoutUser,
//   registerUser,
// } from '../services/auth.js';
// import { refreshUsersSession } from '../services/auth.js';
// export const registerUserController = async (req, res, next) => {
//   const user = await registerUser(req.body);

//   res.status(201).json({
//     status: 201,
//     message: 'Successfully registered a user!',
//     data: user,
//   });
// };

// export const loginUserController = async (req, res, next) => {
//   const session = await loginUser(req.body);
//   res.cookie('refreshToken', session.refreshToken, {
//     httpOnly: true,
//     expires: new Date(Date.now() + ONE_DAY),
//   });
//   res.cookie('sessionId', session._id, {
//     httpOnly: true,
//     expires: new Date(Date.now() + ONE_DAY),
//   });
//   res.json({
//     status: 200,
//     message: 'Successfully logged in!',
//     data: {
//       accessToken: session.accessToken,
//     },
//   });
// };

// export const logoutUserController = async (req, res, next) => {
//   if (req.cookies.SessionId) {
//     await logoutUser(req.cookies.SessionId);
//   }
//   res.clearCookie('refreshToken');
//   res.clearCookie('sessionId');
//   res.status(204).send();
// };

// const setupSession = (res, session) => {
//   res.cookie('refreshToken', session.refreshToken, {
//     httpOnly: true,
//     expires: new Date(Date.now() + ONE_DAY),
//   });
//   res.cookie('sessionId', session._id, {
//     httpOnly: true,
//     expires: new Date(Date.now() + ONE_DAY),
//   });
// };

// export const refreshTokenController = async (req, res) => {
//   const session = await refreshUsersSession({
//     sessionId: req.cookies.sessionId,
//     refreshToken: req.cookies.refreshToken,
//   });
//   console.log('Hello');

//   setupSession(res, session);
//   res.json({
//     status: 200,
//     message: 'Successfully refreshed a session!',
//     data: {
//       accessToken: session.accessToken,
//     },
//   });
// };

// export const getUserInfoController = async (req, res) => {
//   const { _id } = req.user;
//   if (!_id) {
//     throw createHttpError(401, 'Users id not found');
//   }
//   const user = await getUserInfo(_id);
//   if (!user) {
//     throw createHttpError(404, 'User not found');
//   }
//   res.json({
//     status: 200,
//     message: 'Successfully retrieved user info!',
//     data: {
//       email: user.email,
//       name: user.name,
//     },
//   });
// };
import createHttpError from 'http-errors';
import { ONE_DAY } from '../constants/index.js';
import {
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  refreshUsersSession,
} from '../services/auth.js';

/**
 * Контроллер регистрации пользователя
 */
export const registerUserController = async (req, res, next) => {
  const user = await registerUser(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

/**
 * Контроллер логина: создает сессию и устанавливает cookies
 */
export const loginUserController = async (req, res, next) => {
  const session = await loginUser(req.body);
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.json({
    status: 200,
    message: 'Successfully logged in!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

/**
 * Контроллер выхода: удаляет сессию и очищает cookies
 */
export const logoutUserController = async (req, res, next) => {
  try {
    if (req.cookies.sessionId) {
      await logoutUser(req.cookies.sessionId);
    }
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Устанавливает cookies для сессии
 */
const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

/**
 * Контроллер обновления сессии (refresh token)
 */
export const refreshTokenController = async (req, res, next) => {
  const { sessionId, refreshToken } = req.cookies;
  if (!sessionId || !refreshToken) {
    throw createHttpError(400, 'Session ID and refresh token are required');
  }
  const session = await refreshUsersSession({ sessionId, refreshToken });
  setupSession(res, session);
  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

/**
 * Контроллер получения информации о пользователе
 */
export const getUserInfoController = async (req, res, next) => {
  const { _id } = req.user;
  if (!_id) {
    throw createHttpError(401, 'User ID not found');
  }
  const user = await getUserInfo(_id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  res.json({
    status: 200,
    message: 'Successfully retrieved user info!',
    data: {
      email: user.email,
      name: user.name,
    },
  });
};
