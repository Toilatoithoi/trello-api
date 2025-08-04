/* eslint-disable no-useless-catch */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(newBoard)

    // Lấy bản ghi board sau khi gọi (tuỳ mục đích dự án mà có cần bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Làm thêm các xử lý logic khác với các Collection khác tuỳ đặc thù dự án ...v
    // Bắn email, notification về cho admin khi có 1 cái board mới được tạo ...v

    // Trả kết quả về, trong Service luôn phải có return
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // B1: Deep Clone board ra một cái mới để xử lý, không ảnh hướng tới dữ liệu ban đầu, mục đích về sau mà có cần clone deep hay không. (video 63 sẽ giải thích)
    // https://www.javascripttutorial.net/javascript-primitive-vs-reference-values/
    const resBoard = cloneDeep(board)
    // B2: Đưa card về đúng column của nó
    resBoard.columns.forEach(column => {
      // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong MongDB có support method .equals
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))

      // Cách khác đơn giản là convert ObjectId về string bằng hàm toString của JavaScript
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })
    // B3: Xoá mảng cards khỏi board ban đầu
    delete resBoard.cards
    // console.log('resBoard: ', resBoard)

    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    const updateBoard = await boardModel.update(boardId, updateData)

    return updateBoard
  } catch (error) { throw error }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật màng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái id của Card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updateAt: Date.now()
    })

    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm id của Card vào màng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updateAt: Date.now()
    })

    // B3: Cập nhật lại trường columnId mới của cái Card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Successfully!' }
  } catch (error) { throw error }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Nều không tồn tại page hoặc itemsPerPage từ phía FE thì BE sẽ cần phải luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    const results = await boardModel.getBoards (userId, parseInt(page, 10), parseInt(itemsPerPage, 10))

    return results
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}