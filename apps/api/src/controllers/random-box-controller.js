import { sendSuccess } from '../http/response.js'
import { claimRandomBox, getRandomBox } from '../services/random-box-service.js'

export async function getRandomBoxController(request, response, next) {
  try {
    const status = await getRandomBox(request.userId)

    return sendSuccess(response, status)
  } catch (error) {
    return next(error)
  }
}

export async function claimRandomBoxController(request, response, next) {
  try {
    const reward = await claimRandomBox(request.userId)

    return sendSuccess(response, reward)
  } catch (error) {
    return next(error)
  }
}
