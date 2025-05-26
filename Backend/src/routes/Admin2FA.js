const router = require('koa-router')
const {
  xPlatformValidate,
  loginValidate,
  recaptchaValidate,
} = require('../validators/LoginValidate.js')
const {
  tokenAuthentication,
  basicAuthentication,
  preLoginService,
  requestVerifyEmail,
  verifyEmail,
} = require('../middlewares/AuthenticationMiddleware.js')
const { responseFormat } = require('../libs/formatResponse.js')
const { sendEmail } = require('../middlewares/SendEmailMiddleWare.js')
const { requestEnable2FA, confirmEnable2FA, requestOtpEmail2FA, confirmOtpEmail2FA, checkOtpExpiredEmail2FA, disable2FA, admin2FAStatus } = require('../middlewares/Admin2FA.js')
const { VerifyEnable2FAThroughEmailValidate, VerifyOtpEmailValidate } = require('../validators/Admin2FA.js')
const Router = new router()

Router.post('/login/request/otp/email',
  basicAuthentication(),
  xPlatformValidate(),
  loginValidate(),
  preLoginService(),
  requestOtpEmail2FA(),
  sendEmail(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ TempToken: ctx.jwtTemp, RefCode: ctx.ref_code, RequestTime: ctx.request_time, RemainingTime: ctx.remainingTime, OtpExpireIn: ctx.otpRemainingTime }, 'SEND_LINK_IF_EMAIL_EXIST', ctx.language)
  })

Router.get('/status',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  admin2FAStatus(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ data: ctx.result }, 'GET_DATA_SUCCESS', ctx.language)
  })

Router.get('/request/enable',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  requestEnable2FA(),
  sendEmail(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'SEND_LINK_IF_EMAIL_EXIST', ctx.language)
  })

// Router.post('/verify/enable',
//   basicAuthentication(),
//   xPlatformValidate(),
//   VerifyEnable2FAThroughEmailValidate(),
//   confirmEnable2FA(),
//   async ctx => {
//     ctx.status = 200
//     ctx.body = responseFormat({}, 'GET_DATA_SUCCESS', ctx.language)
//   })

// Router.get('/disable',
//   basicAuthentication(),
//   xPlatformValidate(),
//   tokenAuthentication(),
//   disable2FA(),
//   async ctx => {
//     ctx.status = 200
//     ctx.body = responseFormat({}, 'GET_DATA_SUCCESS', ctx.language)
//   })

Router.get('/request/otp/email',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  requestOtpEmail2FA(),
  sendEmail(),

  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ RefCode: ctx.ref_code, RequestTime: ctx.request_time, RemainingTime: ctx.remainingTime, OtpExpireIn: ctx.otpRemainingTime }, 'SEND_LINK_IF_EMAIL_EXIST', ctx.language)
  })

Router.post('/verify/otp/email',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  VerifyOtpEmailValidate(),
  // checkOtpExpiredEmail2FA(),
  confirmOtpEmail2FA(),

  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'GET_DATA_SUCCESS', ctx.language)
  })

module.exports = Router