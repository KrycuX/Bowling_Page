import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionService } from '../../modules/auth/session.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    @Inject(Reflector) private reflector: Reflector,
    @Inject(SessionService)  private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extract session token from cookie
    const sessionToken = request.cookies?.sessionToken;
    
    if (!sessionToken) {
      throw new UnauthorizedException('No session token provided');
    }

    // Validate session
    const session = await this.sessionService.validateSession(sessionToken);
    
    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach user to request
    request.user = session.user;
    request.session = session;

    return true;
  }
}
