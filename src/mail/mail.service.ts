import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;

  constructor(private config: ConfigService) {
    const gmailUser = this.config.get<string>('GMAIL_USER');
    const gmailPass = this.config.get<string>('GMAIL_APP_PASSWORD');

    this.fromEmail = gmailUser || 'noreply@dscplatform.com';

    if (gmailUser && gmailPass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });
      this.logger.log('✅ Gmail SMTP configured');
    } else {
      // Fallback: log to console only (dev mode)
      this.logger.warn('⚠️  GMAIL_USER or GMAIL_APP_PASSWORD not set — emails will only be logged to console');
      this.transporter = null as any;
    }
  }

  async sendOtpEmail(toEmail: string, clientName: string, otpCode: string, documentName: string) {
    const subject = `DSC Platform — Document Signing OTP: ${documentName}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
        
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 32px;">
          <div style="width: 32px; height: 32px; background: #111; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: #fff; font-size: 16px;">🔐</span>
          </div>
          <span style="font-size: 16px; font-weight: 700; color: #111;">DSC Platform</span>
        </div>

        <h2 style="font-size: 20px; font-weight: 700; color: #111; margin-bottom: 8px;">Document Signing Request</h2>
        <p style="font-size: 14px; color: #666; margin-bottom: 24px; line-height: 1.6;">
          Hi <strong>${clientName}</strong>, your CA has requested you to sign the document: <strong>${documentName}</strong>
        </p>

        <div style="background: #f4f4f5; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #888; margin-bottom: 8px; font-weight: 500;">Your One-Time Password (OTP)</p>
          <p style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #111; margin: 0;">${otpCode}</p>
          <p style="font-size: 12px; color: #aaa; margin-top: 10px;">⏱ Valid for 10 minutes only</p>
        </div>

        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
          <p style="font-size: 12px; color: #c2410c; margin: 0; line-height: 1.5;">
            ⚠️ Never share this OTP with anyone. If you did not request this, contact your CA immediately.
          </p>
        </div>

        <p style="font-size: 12px; color: #bbb; text-align: center;">DSC Platform · Secure Digital Document Signing</p>
      </div>
    `;

    // Always log to console for debugging
    this.logger.log(`\n========== OTP EMAIL ==========`);
    this.logger.log(`To: ${toEmail} (${clientName})`);
    this.logger.log(`Document: ${documentName}`);
    this.logger.log(`OTP Code: ${otpCode}`);
    this.logger.log(`================================\n`);

    // Send real email if configured
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"DSC Platform" <${this.fromEmail}>`,
          to: toEmail,
          subject,
          html,
        });
        this.logger.log(`📧 Email sent to ${toEmail}`);
      } catch (err) {
        this.logger.error(`❌ Failed to send email: ${err.message}`);
        // Don't throw — OTP is still saved in DB, user can see it in console
      }
    }
  }
}
