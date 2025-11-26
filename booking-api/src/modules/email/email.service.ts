import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Order, OrderItem, ReservedSlot, PaymentMethod, ContactSubmission, OrderStatus } from '../../database/entities';
import { GlobalSettingsService } from '../settings/global-settings.service';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(ContactSubmission)
    private contactSubmissionRepository: Repository<ContactSubmission>,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  /**
   * Checks if email configuration is complete
   */
  private async isEmailConfigured(): Promise<boolean> {
    const settings = await this.globalSettingsService.getGlobalSettings();
    return !!(
      settings.senderEmail &&
      settings.smtpHost &&
      settings.smtpPort &&
      settings.smtpUser &&
      settings.smtpPassword
    );
  }

  /**
   * Creates nodemailer transporter from settings
   */
  private async createTransporter() {
    const settings = await this.globalSettingsService.getGlobalSettings();

    if (!settings.senderEmail || !settings.smtpHost || !settings.smtpPort) {
      throw new Error('Email configuration is incomplete');
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure ?? true, // true for 465, false for other ports
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    return transporter;
  }

  /**
   * Formats order data for email template
   */
  private async getOrderData(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.resource', 'reservedSlots'],
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    return order;
  }

  /**
   * Generates HTML template for order confirmation email
   */
  private generateOrderEmailHTML(order: Order): string {
    const orderDisplayNumber = order.orderNumber || order.id;
    
    const formatPrice = (amount: number) => {
      return (amount / 100).toFixed(2) + ' ' + order.currency;
    };

    const formatDateTime = (date: Date) => {
      return format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: pl });
    };

    const paymentMethodLabels: Record<PaymentMethod, string> = {
      [PaymentMethod.ONLINE]: 'Płatność online',
      [PaymentMethod.ON_SITE_CASH]: 'Gotówka na miejscu',
      [PaymentMethod.ON_SITE_CARD]: 'Karta na miejscu',
    };

    const resourceTypeLabels: Record<string, string> = {
      BOWLING_LANE: 'Tor kręglowy',
      BILLIARDS_TABLE: 'Stół bilardowy',
      QUIZ_ROOM: 'Sala quizowa',
      KARAOKE_ROOM: 'Sala karaoke',
    };

    const slotsByResource = new Map<number, ReservedSlot[]>();
    order.reservedSlots.forEach((slot) => {
      if (!slotsByResource.has(slot.resourceId)) {
        slotsByResource.set(slot.resourceId, []);
      }
      slotsByResource.get(slot.resourceId)!.push(slot);
    });

    const itemsHTML = order.items
      .map((item) => {
        const slots = slotsByResource.get(item.resourceId) || [];
        const slotsHTML = slots
          .map((slot) => {
            return `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDateTime(slot.startTime)}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDateTime(slot.endTime)}</td>
            </tr>`;
          })
          .join('');

        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; vertical-align: top;">
              <strong>${item.resource.name}</strong><br>
              <span style="color: #666; font-size: 12px;">
                ${resourceTypeLabels[item.resource.type] || item.resource.type}
                ${item.peopleCount ? ` · ${item.peopleCount} os.` : ''}
              </span>
              ${slots.length > 0 ? `
              <table style="margin-top: 8px; width: 100%; font-size: 12px;">
                <tr>
                  <th style="text-align: left; padding: 4px;">Od</th>
                  <th style="text-align: left; padding: 4px;">Do</th>
                </tr>
                ${slotsHTML}
              </table>` : ''}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
              ${formatPrice(item.totalAmount)}
            </td>
          </tr>`;
      })
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potwierdzenie zamówienia</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">Potwierdzenie zamówienia</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Numer zamówienia: <strong>${order.orderNumber || order.id}</strong></p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin-top: 0; color: #667eea;">Dane klienta</h2>
      <p><strong>Imię i nazwisko:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.customerEmail}</p>
      ${order.customerPhone ? `<p><strong>Telefon:</strong> ${order.customerPhone}</p>` : ''}
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin-top: 0; color: #667eea;">Szczegóły zamówienia</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Pozycja</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Cena</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin-top: 0; color: #667eea;">Podsumowanie płatności</h2>
      <table style="width: 100%;">
        ${order.appliedCouponCode ? `
        <tr>
          <td style="padding: 8px 0;"><strong>Kod promocyjny:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${order.appliedCouponCode}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Rabat:</strong></td>
          <td style="padding: 8px 0; text-align: right;">-${formatPrice(order.discountAmount)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0;"><strong>Metoda płatności:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</td>
        </tr>
        ${order.paidAt ? `
        <tr>
          <td style="padding: 8px 0;"><strong>Data płatności:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${formatDateTime(order.paidAt)}</td>
        </tr>` : ''}
        <tr style="border-top: 2px solid #667eea; margin-top: 10px;">
          <td style="padding: 12px 0;"><strong style="font-size: 18px;">${order.status === OrderStatus.PAID ? 'Zapłacono:' : 'Do zapłaty:'}</strong></td>
          <td style="padding: 12px 0; text-align: right;"><strong style="font-size: 18px; color: #667eea;">${formatPrice(order.totalAmount)}</strong></td>
        </tr>
      </table>
    </div>

    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
      <p style="margin: 0; color: #2e7d32;">
        <strong>✓ Rezerwacja potwierdzona</strong><br>
        Dziękujemy za skorzystanie z naszych usług. W razie pytań prosimy o kontakt.
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>To jest automatyczna wiadomość. Prosimy nie odpowiadać na ten email.</p>
  </div>
</body>
</html>`;
  }

  /**
   * Sends order confirmation email
   * @param orderId Order ID
   * @param retryAttempt Current retry attempt (internal use)
   * @param maxRetries Maximum number of retries if order status is not yet PAID
   */
  async sendOrderConfirmationEmail(orderId: string, retryAttempt: number = 0, maxRetries: number = 3): Promise<void> {
    try {
      // Check if email is configured
      if (!(await this.isEmailConfigured())) {
        this.logger.warn('Email configuration is incomplete. Skipping email send.');
        return;
      }

      // Get order data
      const order = await this.getOrderData(orderId);

      // If order is not yet PAID and we have retries left, wait and retry
      // This handles race condition where email is sent before status is fully committed
      if (order.status !== OrderStatus.PAID && retryAttempt < maxRetries) {
        this.logger.log(`Order ${orderId} status is ${order.status}, waiting before retry (attempt ${retryAttempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.sendOrderConfirmationEmail(orderId, retryAttempt + 1, maxRetries);
      }

      // Get settings for sender info
      const settings = await this.globalSettingsService.getGlobalSettings();

      // Create transporter
      const transporter = await this.createTransporter();

      // Generate HTML
      const html = this.generateOrderEmailHTML(order);

      // Send email
      await transporter.sendMail({
        from: settings.senderName
          ? {
              name: settings.senderName,
              address: settings.senderEmail,
            }
          : settings.senderEmail,
        to: order.customerEmail,
        subject: `Potwierdzenie zamówienia #${order.orderNumber || order.id}`,
        html,
      });

      this.logger.log(`Order confirmation email sent successfully for order ${orderId} (status: ${order.status})`);
    } catch (error) {
      // Log error but don't throw - email sending should not break the order flow
      this.logger.error(`Failed to send order confirmation email for order ${orderId}:`, error);
    }
  }

  /**
   * Generates HTML template for contact form confirmation email
   */
  private generateContactFormEmailHTML(submission: ContactSubmission, template?: string): string {
    if (template) {
      // Replace template variables
      return template
        .replace(/\{\{name\}\}/g, submission.name)
        .replace(/\{\{email\}\}/g, submission.email)
        .replace(/\{\{message\}\}/g, submission.message.replace(/\n/g, '<br>'))
        .replace(/\{\{phone\}\}/g, submission.phone || 'Nie podano');
    }

    // Default template
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potwierdzenie otrzymania wiadomości</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">Dziękujemy za wiadomość</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p>Witaj <strong>${submission.name}</strong>,</p>
      <p>Otrzymaliśmy Twoją wiadomość i skontaktujemy się z Tobą najszybciej jak to możliwe.</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin-top: 0; color: #667eea;">Twoja wiadomość:</h2>
      <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 4px;">${submission.message.replace(/\n/g, '<br>')}</p>
    </div>

    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
      <p style="margin: 0; color: #2e7d32;">
        <strong>✓ Wiadomość otrzymana</strong><br>
        W razie pilnych spraw prosimy o kontakt telefoniczny.
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>To jest automatyczna wiadomość. Prosimy nie odpowiadać na ten email.</p>
  </div>
</body>
</html>`;
  }

  /**
   * Generates HTML template for admin notification about new contact form submission
   */
  private generateAdminNotificationHTML(submission: ContactSubmission): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nowa wiadomość z formularza kontaktowego</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">Nowa wiadomość z formularza kontaktowego</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p><strong>Nowa wiadomość została wysłana z formularza kontaktowego.</strong></p>
      <p>Sprawdź szczegóły w panelu administracyjnym.</p>
      <p style="margin-top: 20px;">
        <strong>ID zgłoszenia:</strong> #${submission.id}<br>
        <strong>Data:</strong> ${format(new Date(submission.createdAt), 'dd MMMM yyyy, HH:mm', { locale: pl })}
      </p>
    </div>

    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404;">
        <strong>ℹ️ Uwaga:</strong> Pełna treść wiadomości oraz szczegóły są dostępne w panelu administracyjnym.
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Sends emails for contact form submission
   */
  async sendContactFormEmails(submissionId: number): Promise<void> {
    try {
      // Check if email is configured
      if (!(await this.isEmailConfigured())) {
        this.logger.warn('Email configuration is incomplete. Skipping email send.');
        return;
      }

      // Get submission data
      const submission = await this.contactSubmissionRepository.findOne({
        where: { id: submissionId },
      });

      if (!submission) {
        this.logger.error(`Contact submission ${submissionId} not found`);
        return;
      }

      // Get settings
      const settings = await this.globalSettingsService.getGlobalSettings();

      // Create transporter
      const transporter = await this.createTransporter();

      // Send confirmation email to customer
      const customerHtml = this.generateContactFormEmailHTML(submission, settings.contactFormEmailTemplate || undefined);
      await transporter.sendMail({
        from: settings.senderName
          ? `${settings.senderName} <${settings.senderEmail}>`
          : settings.senderEmail,
        to: submission.email,
        subject: 'Potwierdzenie otrzymania wiadomości - TheAlley2B',
        html: customerHtml,
      });

      this.logger.log(`Contact form confirmation email sent to ${submission.email}`);

      // Send notification email to admin (if admin email is configured)
      if (settings.senderEmail) {
        const adminHtml = this.generateAdminNotificationHTML(submission);
        await transporter.sendMail({
          from: settings.senderName
            ? `${settings.senderName} <${settings.senderEmail}>`
            : settings.senderEmail,
          to: settings.senderEmail,
          subject: `Nowa wiadomość z formularza kontaktowego #${submission.id}`,
          html: adminHtml,
        });

        this.logger.log(`Contact form notification email sent to admin`);
      }
    } catch (error) {
      // Log error but don't throw - email sending should not break the contact form flow
      this.logger.error(`Failed to send contact form emails for submission ${submissionId}:`, error);
    }
  }

  /**
   * Sends refund notification email to customer
   */
  async sendRefundNotificationEmail(orderId: string, reason: string): Promise<void> {
    try {
      if (!(await this.isEmailConfigured())) {
        this.logger.warn('Email configuration is incomplete. Skipping email send.');
        return;
      }

      const order = await this.getOrderData(orderId);
      const settings = await this.globalSettingsService.getGlobalSettings();
      const transporter = await this.createTransporter();

      const formatPrice = (amount: number) => {
        return (amount / 100).toFixed(2) + ' ' + order.currency;
      };

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zwrot płatności</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">Zwrot płatności</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Numer zamówienia: <strong>${order.id}</strong></p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p>Witaj <strong>${order.customerName}</strong>,</p>
      <p>Informujemy, że zwróciliśmy płatność za zamówienie <strong>#${order.id}</strong>.</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin-top: 0; color: #667eea;">Powód zwrotu</h2>
      <p>${reason}</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin-top: 0; color: #667eea;">Kwota zwrotu</h2>
      <p style="font-size: 24px; color: #667eea; font-weight: bold;">${formatPrice(order.totalAmount)}</p>
      <p style="color: #666; font-size: 14px;">Zwrot zostanie przeliczony na konto, z którego dokonano płatności, w ciągu kilku dni roboczych.</p>
    </div>

    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404;">
        <strong>ℹ️ Informacja:</strong> Jeśli masz pytania dotyczące zwrotu, prosimy o kontakt.
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>To jest automatyczna wiadomość. Prosimy nie odpowiadać na ten email.</p>
  </div>
</body>
</html>`;

      await transporter.sendMail({
        from: settings.senderName
          ? `${settings.senderName} <${settings.senderEmail}>`
          : settings.senderEmail,
        to: order.customerEmail,
        subject: `Zwrot płatności - Zamówienie #${order.id}`,
        html,
      });

      this.logger.log(`Refund notification email sent successfully for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to send refund notification email for order ${orderId}:`, error);
    }
  }

  /**
   * Sends email notification when late payment slot is taken
   */
  async sendLatePaymentSlotTakenEmail(orderId: string): Promise<void> {
    try {
      if (!(await this.isEmailConfigured())) {
        this.logger.warn('Email configuration is incomplete. Skipping email send.');
        return;
      }

      const order = await this.getOrderData(orderId);
      const settings = await this.globalSettingsService.getGlobalSettings();
      const transporter = await this.createTransporter();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rezerwacja niedostępna</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">Rezerwacja niedostępna</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Numer zamówienia: <strong>${order.id}</strong></p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p>Witaj <strong>${order.customerName}</strong>,</p>
      <p>Niestety, płatność za zamówienie <strong>#${order.id}</strong> została zrealizowana po wygaśnięciu rezerwacji.</p>
      <p>W tym czasie wybrane terminy zostały już zarezerwowane przez innego klienta.</p>
    </div>

    <div style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
      <p style="margin: 0; color: #c62828;">
        <strong>⚠️ Ważne:</strong> Zwróciliśmy pełną kwotę płatności na Twoje konto. Zwrot zostanie przeliczony w ciągu kilku dni roboczych.
      </p>
    </div>

    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
      <p style="margin: 0; color: #1565c0;">
        <strong>💡 Wskazówka:</strong> Aby uniknąć podobnych sytuacji w przyszłości, prosimy o dokonanie płatności w wyznaczonym terminie.
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>To jest automatyczna wiadomość. Prosimy nie odpowiadać na ten email.</p>
  </div>
</body>
</html>`;

      await transporter.sendMail({
        from: settings.senderName
          ? `${settings.senderName} <${settings.senderEmail}>`
          : settings.senderEmail,
        to: order.customerEmail,
        subject: `Rezerwacja niedostępna - Zamówienie #${order.id}`,
        html,
      });

      this.logger.log(`Late payment slot taken email sent successfully for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to send late payment slot taken email for order ${orderId}:`, error);
    }
  }
}

