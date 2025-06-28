/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  /**
  * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì vì để cho Front-end tự validate và custom message phía FE cho đẹp
  * Back-end chỉ cần validate Đảm bảo dữ liệu chuẩn xác, và trả về message mặc định từ thư viện là được
  * Quan trọng: Việc Validation dữ liệu Bắt Buộc phải có Back-end vì đây là điểm cuối để lưu dữ liệu vào Database.
  * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn validation dữ liệu ở cả Back-end và Front-end nhé.
  */
  // required: không có thuộc tính
  // empty: có thuộc tính nhưng thuộc tính có giá trị null hoặc ""
  // trim với strict sẽ đi với nhau nếu không sẽ không bắt lỗi
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required (trungquandev)',
      'string.empty': 'Title is not allowed to be empty (trungquandev)',
      'string.min': 'Title min 3 chars (trungquandev)',
      'string.max': 'Title max 50 chars (trungquandev)',
      'string.trim': 'Title must not have leading or trailing whitespace (trungquandev)'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict()
  })

  try {
    // Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi (video 52)
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // next là middleware function callback được Express.js sử dụng để chuyển quyền điều khiển sang middleware tiếp theo trong chuỗi xử lý request
    // setup từ boardRoute sau khi chạy vào boardValidation.createNew sẽ chạy đến boardController.createNew
    // Validation dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang Controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    // Code: 422 Lỗi các thực thể dữ liệu không thể thực thi (thường dùng mã lỗi này cho validation)
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }


}

export const boardValidation = {
  createNew
}
