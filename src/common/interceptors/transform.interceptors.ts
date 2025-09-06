import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * TransformInterceptor
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  /**
   * Phương thức intercept chuyển đổi phản hồi
   * @param context - Ngữ cảnh thực thi
   * @param next - Trình xử lý tiếp theo trong chuỗi
   * @returns Observable với phản hồi API tiêu chuẩn hóa
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = ctx.getResponse();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { message, ...responseData } = data || {};
        return {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: responseData,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          statusCode,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: message || 'Success',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
