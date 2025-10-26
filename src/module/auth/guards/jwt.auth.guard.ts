import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('publicRoute', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip JWT validation for public routes
    }

    return super.canActivate(context);
  }
}
