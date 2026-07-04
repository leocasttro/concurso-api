import { ErrorStatus } from './error-status';

export class BusinessException extends Error {
  constructor(
    message: string,
    public readonly code = 'BUSINESS_ERROR',
    public readonly status = ErrorStatus.BAD_REQUEST,
  ) {
    super(message);
    this.name = 'BusinessException';
  }
}
