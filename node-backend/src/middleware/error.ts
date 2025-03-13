import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface ErrorResponse extends Error {
  statusCode?: number;
  code?: number;
  errors?: any;
  value?: any;
}

interface ValidationError {
  message: string;
}

export const errorHandler = (err: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new Error(message) as ErrorResponse;
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message) as ErrorResponse;
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values<ValidationError>(err.errors || {})
      .map(val => val.message);
    error = new Error(message.join(', ')) as ErrorResponse;
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};

// Async handler to eliminate try-catch blocks
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as ErrorResponse;
  error.statusCode = 404;
  next(error);
};
