const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ WARNING: Email credentials missing in .env. Emails will not be sent.');
            this.enabled = false;
        } else {
            this.enabled = true;
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // Use SSL
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                pool: true, // Use connection pool
                maxConnections: 5,
                maxMessages: 100,
                connectionTimeout: 10000, // 10 seconds
                greetingTimeout: 5000,
                socketTimeout: 15000,
                tls: {
                    // Do not fail on invalid certificates (helpful in some cloud environments)
                    rejectUnauthorized: false,
                },
            });
            console.log('✅ Email Service Initialized (SSL/Pool enabled)');
        }
    }

    /**
     * Sanitizes strings to prevent Log Injection by removing line breaks.
     * @param {string} str
     * @returns {string}
     */
    _sanitizeForLog(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[\r\n]/g, '_');
    }

    /**
     * Sends a welcome email with login credentials
     * @param {Object} user User details (name, email)
     * @param {string} password Temporary password
     * @param {string} role 'Faculty' or 'Student'
     */
    async sendWelcomeEmail(user, password, role) {
        if (!this.enabled) {
            console.log(`Skipping email to ${this._sanitizeForLog(user.email)} (Service disabled or missing config)`);
            return null;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"DASEP Platform" <dasep.ndmatrix@gmail.com>',
            to: user.email,
            subject: `Welcome to DASEP - Your Account Credentials`,
            html: this._getWelcomeTemplate(user.name, user.email, password, role),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email sent to ${this._sanitizeForLog(user.email)}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`Error sending email to ${this._sanitizeForLog(user.email)}:`, error);
            // We don't throw here to avoid breaking the creation flow if email fails,
            // but in production you might want to handle this differently.
            return null;
        }
    }

    /**
     * Sends a notification email after a password change
     * @param {Object} user User details (name, email)
     */
    async sendPasswordChangeNotification(user) {
        if (!this.enabled) {
            console.log(
                `Skipping password change email to ${this._sanitizeForLog(user.email)} (Service disabled or missing config)`,
            );
            return null;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"DASEP Platform" <dasep.ndmatrix@gmail.com>',
            to: user.email,
            subject: `Security Alert: Your DASEP Password was Changed`,
            html: this._getChangePasswordTemplate(user.name),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Password change notification sent to ${this._sanitizeForLog(user.email)}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`Error sending password change notification to ${this._sanitizeForLog(user.email)}:`, error);
            return null;
        }
    }

    _getWelcomeTemplate(name, email, password, role) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
                .header { background-color: #1a73e8; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; }
                .creds-box { background-color: #f8f9fa; border: 1px dashed #1a73e8; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .footer { background-color: #f1f3f4; color: #5f6368; padding: 15px; text-align: center; font-size: 12px; }
                .btn { display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px; }
                .note { color: #d93025; font-weight: bold; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to DASEP</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Welcome to the <strong>Digital Answer Sheet Evaluation Platform (DASEP)</strong>. Your account has been successfully created as a <strong>${role}</strong>.</p>
                    
                    <p>Please use the following credentials to access your portal:</p>
                    
                    <div class="creds-box">
                        <p><strong>Login URL:</strong> <a href="http://portal.dasep.com">portal.dasep.com</a></p>
                        <p><strong>Username/Email:</strong> ${email}</p>
                        <p><strong>Temporary Password:</strong> <code style="background:#eee; padding:2px 5px;">${password}</code></p>
                    </div>

                    <a href="http://portal.dasep.com" class="btn" style="color: white;">Login to Dashboard</a>

                    <p class="note">IMPORTANT: For security reasons, please change your password immediately after your first login.</p>
                    <p>The <strong>change password option</strong> is available in your <strong>Profile section</strong> at the portal.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} DASEP - Digital Evaluation Platform. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `;
    }

    _getChangePasswordTemplate(name) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
                .header { background-color: #d93025; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; }
                .footer { background-color: #f1f3f4; color: #5f6368; padding: 15px; text-align: center; font-size: 12px; }
                .alert-box { background-color: #fff4f2; border: 1px solid #d93025; padding: 20px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Security Notification</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>This is a security alert to inform you that your password for the <strong>Digital Answer Sheet Evaluation Platform (DASEP)</strong> was recently changed.</p>
                    
                    <div class="alert-box">
                        <p><strong>Action:</strong> Password Change</p>
                        <p><strong>Status:</strong> Success</p>
                        <p><strong>Time:</strong> ${new Date().toUTCString()}</p>
                    </div>

                    <p>If you made this change, you can safely ignore this email.</p>
                    <p style="color: #d93025; font-weight: bold;">If you did NOT change your password, please contact your administrator immediately to secure your account.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} DASEP - Digital Evaluation Platform. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new EmailService();
