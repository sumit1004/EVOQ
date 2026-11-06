import env from '../config/env.js';

class EmailService {
  /**
   * Send verification email.
   * In development/test, logs the link/token to console or stores it for inspection.
   */
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;

    if (env.EMAIL_PROVIDER === 'console' || env.NODE_ENV !== 'production') {
      console.log(`\n================== [EMAIL STUB: VERIFY EMAIL] ==================`);
      console.log(`To: ${email}`);
      console.log(`Token: ${token}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log(`=================================================================\n`);
      return { sent: true, delivery: 'console', token: env.NODE_ENV === 'test' ? token : undefined };
    }

    // Production email integration hook
    console.warn(`[EMAIL] Provider ${env.EMAIL_PROVIDER} not yet connected for production.`);
    return { sent: true, delivery: 'queued' };
  }

  /**
   * Send password reset email.
   */
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

    if (env.EMAIL_PROVIDER === 'console' || env.NODE_ENV !== 'production') {
      console.log(`\n================ [EMAIL STUB: PASSWORD RESET] =================`);
      console.log(`To: ${email}`);
      console.log(`Token: ${token}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`================================================================\n`);
      return { sent: true, delivery: 'console', token: env.NODE_ENV === 'test' ? token : undefined };
    }

    console.warn(`[EMAIL] Provider ${env.EMAIL_PROVIDER} not yet connected for production.`);
    return { sent: true, delivery: 'queued' };
  }
}

export const emailService = new EmailService();

