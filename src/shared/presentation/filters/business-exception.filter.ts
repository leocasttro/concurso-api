import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { BusinessException } from '../../domain/exceptions/business.exception';

@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter<BusinessException> {
  catch(exception: BusinessException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    response.status(exception.status).json({
      statusCode: exception.status,
      error: exception.code,
      message: exception.message,
    });
  }
}
