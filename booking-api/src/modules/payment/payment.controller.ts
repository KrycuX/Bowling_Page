import { Controller, Post, Get, Body, Query, Param, Inject, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentService, WebhookPayload } from './payment.service';
import { IsNumber, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

class P24WebhookDto implements WebhookPayload {
  @IsNumber()
  merchantId: number;

  @IsNumber()
  posId: number;

  @IsString()
  sessionId: string;

  @IsInt()
  orderId: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  sign: string;

  // Dodatkowe pola od Przelewy24 (opcjonalne)
  @IsOptional()
  @IsNumber()
  originAmount?: number;

  @IsOptional()
  @IsNumber()
  methodId?: number;

  @IsOptional()
  @IsString()
  statement?: string;
}

class PaymentReturnQueryDto {
  @IsString()
  @Transform(({ value }) => {
    // Obsługa zarówno stringa jak i array
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  })
  sessionId: string;

  @IsOptional()
  @IsString()
  status?: string;
}

@Controller('payments')
export class PaymentController {
  constructor(
    @Inject (PaymentService) private readonly paymentService: PaymentService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  @Post('p24/webhook')
  async handleWebhook(@Body() payload: P24WebhookDto, @Req() req: Request) {
    
    await this.paymentService.handleP24Webhook(payload);
    return { status: 'ok' };
  }

  @Get('status/:sessionId')
  async getPaymentStatus(@Param('sessionId') sessionId: string) {
    return this.paymentService.getPaymentStatusBySessionId(sessionId);
  }

  // Endpoint return - używany tylko dla mock mode
  // W produkcji: urlReturn wskazuje na frontend, Przelewy24 przekierowuje tam użytkownika
  // Przelewy24 NIE przekazuje parametrów w return URL - to tylko redirect dla użytkownika
  // Weryfikacja (trnVerify) jest w webhooku (urlStatus)
  @Get('return')
  @Post('return')
  async handleReturn(@Req() req: Request, @Res() res: Response) {
    // W prawdziwej produkcji Przelewy24 nie trafia tutaj - przekierowuje na frontend
    // Ten endpoint jest tylko dla mock mode lub przypadkowego trafienia
    
    // Sprawdź czy to mock mode
    const sessionIdFromQuery = req.query.sessionId;
    const statusFromQuery = req.query.status;
    
    let sessionId: string | undefined;
    let status: string | undefined;
    
    if (sessionIdFromQuery) {
      if (Array.isArray(sessionIdFromQuery)) {
        sessionId = typeof sessionIdFromQuery[0] === 'string' ? sessionIdFromQuery[0] : String(sessionIdFromQuery[0]);
      } else if (typeof sessionIdFromQuery === 'string') {
        sessionId = sessionIdFromQuery;
      } else {
        sessionId = String(sessionIdFromQuery);
      }
    }
    
    if (statusFromQuery) {
      status = Array.isArray(statusFromQuery) ? String(statusFromQuery[0]) : String(statusFromQuery);
    }

    const allowedOrigins = this.configService.get<string>('ALLOWED_ORIGINS', '');
    const frontendUrl = allowedOrigins ? allowedOrigins.split(',')[0].trim() : 'http://localhost:3000';

    // Jeśli to mock mode z sessionId, obsłuż mock payment
    if (status === 'mock' && sessionId) {
      try {
        await this.paymentService.handleMockPaymentReturn(sessionId);
        return res.redirect(`${frontendUrl}/rezerwacje/powrot?sessionId=${sessionId}&status=success`);
      } catch (error) {
        return res.redirect(`${frontendUrl}/rezerwacje/powrot?sessionId=${sessionId}&status=error`);
      }
    }

    // W normalnym przypadku, po prostu przekieruj na frontend
    // Frontend sam sprawdzi status przez API na podstawie sessionId z URL
    return res.redirect(`${frontendUrl}/rezerwacje/powrot`);
  }
}
