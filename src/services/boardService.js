/* eslint-disable no-useless-catch */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    // ...

    // Làm thêm các xử lý logic khác với các Collection khác tuỳ đặc thù dự án ...v
    // Bắn email, notification về cho admin khi có 1 cái board mới được tạo ...v

    // Trả kết quả về, trong Service luôn phải có return
    return newBoard
  } catch (error) { throw error }
}

export const boardService = {
  createNew
}