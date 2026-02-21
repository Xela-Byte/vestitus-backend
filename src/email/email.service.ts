import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private isConfigured = false;
  private readonly fromEmail: string;

  constructor() {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(
        '⚠️  Email service not configured. Please set RESEND_API_KEY in .env file.',
      );
      this.logger.warn(
        '📧 Email notifications will be skipped. See docs/EMAIL_SETUP.md for setup instructions.',
      );
      return;
    }

    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.isConfigured = true;
    this.fromEmail =
      process.env.EMAIL_FROM || 'Vestitus <onboarding@resend.dev>';

    this.logger.log('✅ Email service initialized with Resend');
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Skipping OTP email to ${email} - Email service not configured`,
      );
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #4CAF50; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP is valid for 10 minutes.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">© 2026 Vestitus. All rights reserved.</p>
          </div>
        `,
      });
      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Skipping welcome email to ${email} - Email service not configured`,
      );
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Welcome to Vestitus!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Vestitus, ${fullName}!</h2>
            <p>Thank you for joining us. We're excited to have you on board.</p>
            <p>Start exploring our collection and find the perfect outfit for you.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">© 2026 Vestitus. All rights reserved.</p>
          </div>
        `,
      });
      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      // Don't throw error for welcome email - it's not critical
    }
  }

  async sendPasswordResetConfirmation(
    email: string,
    fullName: string,
  ): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Skipping password reset confirmation to ${email} - Email service not configured`,
      );
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Password Reset Successful',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Successful</h2>
            <p>Hi ${fullName},</p>
            <p>Your password has been successfully reset.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">© 2026 Vestitus. All rights reserved.</p>
          </div>
        `,
      });
      this.logger.log(
        `Password reset confirmation email sent successfully to ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset confirmation email to ${email}:`,
        error,
      );
      // Don't throw error - password was already reset
    }
  }

  async sendEmailChangeNotification(
    oldEmail: string,
    newEmail: string,
    fullName: string,
  ): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Skipping email change notification to ${oldEmail} - Email service not configured`,
      );
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: oldEmail,
        subject: 'Email Address Changed',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Address Changed</h2>
            <p>Hi ${fullName},</p>
            <p>This is to notify you that your email address has been changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
            <p>If you didn't make this change, please contact our support team immediately to secure your account.</p>
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <strong>Security Notice:</strong> For your account security, you'll need to use your new email address for future logins.
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">© 2026 Vestitus. All rights reserved.</p>
          </div>
        `,
      });
      this.logger.log(
        `Email change notification sent successfully to ${oldEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email change notification to ${oldEmail}:`,
        error,
      );
      // Don't throw error - email was already changed
    }
  }

  async sendAccountDeletionNotification(
    email: string,
    fullName: string,
  ): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Skipping account deletion notification to ${email} - Email service not configured`,
      );
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Account Deleted',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Account Deletion Confirmation</h2>
            <p>Hi ${fullName},</p>
            <p>Your Vestitus account has been deleted. All your personal data and preferences have been removed from our system.</p>
            <p>If you didn't request this deletion, please contact our support team immediately.</p>
            <p>We're sorry to see you go. If you'd like to join us again in the future, you're always welcome!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">© 2026 Vestitus. All rights reserved.</p>
          </div>
        `,
      });
      this.logger.log(
        `Account deletion notification sent successfully to ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send account deletion notification to ${email}:`,
        error,
      );
      // Don't throw error - account was already deleted
    }
  }
}
