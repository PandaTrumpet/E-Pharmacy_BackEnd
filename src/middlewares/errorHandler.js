import { HttpError } from 'http-errors';
export const errorHandler = (err, req, res, next) => {
  console.log(err.name);

  if (err.name === 'CastError') {
    res.status(400).json({
      status: 400,
      message: 'Invalid ID format',
      error: err.message,
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    message: 'Something went wrong',
    error: err.message,
  });
};
