/**
 * ProMailerProvider - Gửi email qua ProMailer REST API
 * Giải pháp khi Render/hosting chặn port SMTP 465/587
 * Interface: sendEmail({ to, subject, html }) - tương thích NodeMailerProvider
 * Docs: https://www.promailer.xyz/documentation
 * Dashboard: https://www.promailer.xyz/dashboard/smtp | https://www.promailer.xyz/dashboard/api-keys
 *
 * API thực tế: mailserver.automationlounge.com (promailer.xyz là frontend)
 * Có thể override full URL qua PROMAILER_API_URL trong .env
 */
import { env } from '~/config/environment'

// Endpoint chính thức từ Dashboard: POST /api/v1/messages/send
const getApiUrl = () => {
  if (env.PROMAILER_API_URL) return env.PROMAILER_API_URL.replace(/\/$/, '')
  const base = (env.PROMAILER_BASE_URL || 'https://mailserver.automationlounge.com').replace(/\/$/, '')
  const path = env.PROMAILER_API_PATH || '/api/v1/messages/send'
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Gửi email qua ProMailer API
 * @param {Object} params
 * @param {string} params.to - Email người nhận
 * @param {string} params.subject - Tiêu đề
 * @param {string} params.html - Nội dung HTML
 * @returns {Promise<Object>} Kết quả từ ProMailer API
 */
const sendEmail = async ({ to, subject, html }) => {
  const apiUrl = getApiUrl()
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.PROMAILER_API_KEY}`
    },
    body: JSON.stringify({
      to: Array.isArray(to) ? to[0] : to, // API chấp nhận string, không phải array
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''), // Plain text fallback (optional)
      ...(env.PROMAILER_SMTP_ID && { smtpId: env.PROMAILER_SMTP_ID }) // Optional, mặc định dùng connection mặc định
    })
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`ProMailer API error ${response.status}: ${errBody}`)
  }

  return response.json()
}

export const ProMailerProvider = {
  sendEmail
}
