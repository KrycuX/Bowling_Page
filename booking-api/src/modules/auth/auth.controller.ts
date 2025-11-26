import { Controller, Post, Get, Body, Req, Res, UseGuards, Ip, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TurnstileGuard } from '../../common/guards/turnstile.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';
import { IsEmail, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

@Controller('admin/auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(SessionService)
    private sessionService: SessionService,
  ) {}

  @Post('login')
  @UseGuards(TurnstileGuard)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
      ipAddress,
      userAgent,
    );

    // Get session to retrieve csrfToken
    const session = await this.sessionService.findSession(result.sessionToken);

    // Set cookie - configure for production or localhost
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction, // Only secure in production (HTTPS required)
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    };

    // Only set domain in production (for subdomains)
    // On localhost, don't set domain to allow cookie to work
    if (isProduction) {
      cookieOptions.domain = '.thealley2b.pl'; // Available for all subdomains
    }

    res.cookie('sessionToken', result.sessionToken, cookieOptions);

    // Set CSRF token in header
    if (session?.csrfToken) {
      res.setHeader('x-csrf-token', session.csrfToken);
    }

    return res.json({ 
      user: result.user,
      csrfToken: session?.csrfToken || '',
    });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.sessionToken;
    
    if (token) {
      await this.sessionService.deleteSession(token);
    }

    // Clear cookie with same options used when setting it
    const isProduction = process.env.NODE_ENV === 'production';
    const clearCookieOptions: any = {};
    
    if (isProduction) {
      clearCookieOptions.domain = '.thealley2b.pl'; // Must match the domain used when setting the cookie
    }

    res.clearCookie('sessionToken', clearCookieOptions);
    return res.json({ success: true });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: User, @Req() req: Request, @Res() res: Response) {
    // Get session from request (set by AuthGuard)
    // AuthGuard sets req.session as { user: User; session: Session }
    const sessionData = (req as any).session;
    const sessionEntity = sessionData?.session;
    
    // Set CSRF token in header
    if (sessionEntity?.csrfToken) {
      res.setHeader('x-csrf-token', sessionEntity.csrfToken);
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      csrfToken: sessionEntity?.csrfToken || '',
    });
  }
}
