/**
 * YouTube: TrungQuanDev - Một Lập Trình Viên
 * Created by trungquandev.com's author on Sep 27, 2023
 */
/**
 * Simple method to Convert a String to Slug
 * Các bạn có thể tham khảo thêm kiến thức liên quan ở đây: https://byby.dev/js-slugify-string
 */
import { pick } from 'lodash'

export const slugify = (val) => {
  if (!val) return ''
  return String(val)
    .normalize('NFKD') // Tách các chữ cái có dấu thành phần chữ cái gốc và các dấu thanh/dấu phụ đi kèm
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ tất cả các dấu (dấu phụ), mà ở đây đều nằm trong khối Unicode \u03xx.
    .trim() // Loại bỏ ký tự trắng dư thừa ở đầu và cuối chuỗi
    .toLowerCase() // Chuyển thành chữ thường
    .replace(/[^a-z0-9 -]/g, '') // Loại bỏ các ký tự không phải chữ và số
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // loại bỏ các dấu gạch ngang liên tiếp
}

// Lấy một vài dữ liệu cụ thể trong User đề tránh việc trả về các dữ liệu nhạy cảm như hash password
export const pickUser = (user) => {
  if (!user) return {}
  return pick(user, ['_id', 'email', 'username', 'displayName', 'avatar', 'role', 'isActive', 'createdAt', 'updatedAt'])
}