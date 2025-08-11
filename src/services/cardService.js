/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }

    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }


    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }

    let updateCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')

      updateCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    }
    else {
      // Các trường hợp update chung như title, description
      updateCard = await cardModel.update(cardId, updateData)
    }

    return updateCard
  } catch (error) { throw error }
}


export const cardService = {
  createNew,
  update
}