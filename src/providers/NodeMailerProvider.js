/**
 * NodeMailerProvider - Gửi email qua SMTP (nodemailer)
 * Interface tương thích với ResendProvider: sendEmail({ to, subject, html })
 * Cấu hình: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM_NAME, EMAIL_FROM_ADDRESS
 * Gmail: cần bật "App Password" tại https://myaccount.google.com/apppasswords
 */
import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(env.EMAIL_PORT, 10) || 465,
  secure: env.EMAIL_SECURE === 'true',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
})

/**
 * Gửi email
 * @param {Object} params
 * @param {string} params.to - Email người nhận
 * @param {string} params.subject - Tiêu đề
 * @param {string} params.html - Nội dung HTML
 * @returns {Promise<Object>} Kết quả từ nodemailer (info, messageId, ...)
 */
const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `"${env.EMAIL_FROM_NAME || 'Trello Service'}" <${env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html
  })
  return info
}

export const NodeMailerProvider = {
  sendEmail
}
