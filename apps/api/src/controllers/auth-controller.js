import { signup } from '../services/auth-service.js'
import { sendSuccess } from '../http/response.js'

export async function signupController(request, response, next) {
  try {
    const user = await signup(request.validated.body)

    return sendSuccess(response, user, { status: 201 })
  } catch (error) {
    return next(error)
  }
}
