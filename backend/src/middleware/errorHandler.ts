import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors.js'
import { env } from '../config/env.js'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('Error:', err)
  }

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    })
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string }
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        error: {
          message: 'A record with this value already exists',
          code: 'DUPLICATE_ENTRY',
        },
      })
    }
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: {
          message: 'Record not found',
          code: 'NOT_FOUND',
        },
      })
    }
  }

  // Handle unknown errors
  console.error('Unhandled error:', err)

  res.status(500).json({
    error: {
      message: env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      code: 'INTERNAL_ERROR',
    },
  })
}
