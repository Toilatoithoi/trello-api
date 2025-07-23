// Author: TrungQuanDev: https://youtube.com/@trungquandev
// https://resend.com/
import { Resend } from 'resend'
import { env } from '~/config/environment'

// LƯU Ý QUAN TRỌNG VỀ BÀO MẶT: Trong thực tế những cái API Key này sẽ được lưu trữ trong file .env (TUYỆT ĐÔI KHÔNG PUSH KEY LÊN GITHUB)
// Vì làm nhanh gọn nên mình sẽ bỏ qua. Bởi vì mình đã có video hướng dẫn về biến môi trường ở đây rồi, nếu bạn chưa xem thì hãy xem nhé:
// Tổ chức biến môi trường ENV đúng cách: https://youtu.be/Vgr3MWb7a0w?si=r8zQi2xGD6pnAN6g


// Đề gửi email, bạn phải chứng minh được rằng bạn sở hữu và có quyền kiểm soát tên miền (domain) mà bạn đang dùng để gửi. Giống như mình có dmomain là trungquandev.com chẳng hạn.
// Nếu bạn không có domain thì bắt buộc phải dùng tạm email dev này của Resend đề test gửi mail.

// Tạo một cái instance của Resend để sử dụng
const resendInstace = new Resend(env.RESEND_API_KEY)

// Function để gửi email
const sendEmail = async ({ to, subject, html }) => {
  const data = await resendInstace.emails.send({
    from: env.ADMIN_SENDER_EMAIL,
    to, // Nếu chưa valid domain thì chỉ được gửi đến email mà bạn đã đăng ký tài khoản với Resend
    subject,
    html
  })

  return data
}

export const ResendProvider = {
  sendEmail
}