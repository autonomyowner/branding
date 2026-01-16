export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class QuotaExceededError extends AppError {
  constructor(resource: string, limit: number) {
    super(429, `${resource} limit reached (${limit})`, 'QUOTA_EXCEEDED')
    this.name = 'QuotaExceededError'
  }
}

export class FeatureNotAvailableError extends AppError {
  constructor(feature: string, requiredPlan: string) {
    super(403, `${feature} requires ${requiredPlan} plan`, 'FEATURE_UNAVAILABLE')
    this.name = 'FeatureNotAvailableError'
  }
}
