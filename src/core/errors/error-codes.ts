/**
 * Catalog of business error codes for the application.
 * Format: APP-XXX
 */
export enum ErrorCode {
  // Generic & System Errors (001-099)
  INTERNAL_ERROR = 'APP-001',
  VALIDATION_ERROR = 'APP-002',
  INVALID_INPUT = 'APP-003',

  // Authentication & Authorization (100-199)
  UNAUTHORIZED = 'APP-100',
  FORBIDDEN = 'APP-101',
  TOKEN_EXPIRED = 'APP-102',

  // Resource Errors (200-299)
  NOT_FOUND = 'APP-200',
  ALREADY_EXISTS = 'APP-201',
  CONFLICT = 'APP-202',

  // Business Logic Errors (300-399)
  BUSINESS_RULE_VIOLATION = 'APP-300',
}
