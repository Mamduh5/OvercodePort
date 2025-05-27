const router = require('koa-router')
const {
  xPlatformValidate,
  UpdateUserInfoValidate,
  recaptchaValidate,

} = require('../validators/LoginValidate.js')
const {
  basicAuthentication,
  tokenAuthentication,
  currentUserInfo,
  changeUserInfo,
  changePassword,
  requestPasswordReset,
  resetPasswordFromEmail,
  requestVerifyEmail,
  verifyEmail
} = require('../middlewares/AuthenticationMiddleware.js')
const { sendEmail } = require('../middlewares/SendEmailMiddleWare.js')
const { responseFormat } = require('../libs/formatResponse.js')
const { getAllListAdmins, insertAdmins } = require('../middlewares/Admins.js')
const { InsertAdminsValidate } = require('../validators/Admins.js')
const { setAction, authMonitorAdminMovement } = require('../middlewares/AdminsActivityLogs.js')
const { ChangeAdminsValidate, RequestResetAdminsValidate, ResetAdminsPasswordFromEmailValidate, VerifyEmailThroughEmailValidate } = require('../validators/Admins.js')

const Router = new router()

Router.get('/list',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  getAllListAdmins(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ data: ctx.result , AllowValue:ctx.AllowValue }, 'GET_DATA_SUCCESS', ctx.language)
  })

Router.post('/insert',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  InsertAdminsValidate(),
  insertAdmins(),
  setAction(1),
  authMonitorAdminMovement(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'POST_DATA_SUCCESS', ctx.language)
  })

Router.get('/admin/info',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  currentUserInfo(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ ...ctx.result }, 'GET_DATA_SUCCESS', ctx.language)
  })

Router.patch('/update/admin/info',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  UpdateUserInfoValidate(),
  changeUserInfo(),
  setAction(2),
  authMonitorAdminMovement(),
  
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ }, 'GET_DATA_SUCCESS', ctx.language)
  })

Router.patch('/change/password',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  
  ChangeAdminsValidate(),
  changePassword(),
  setAction(4),
  authMonitorAdminMovement(),
  
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'PASSWORD_CHANGED_SUCCESSFULLY', ctx.language)
  })
Router.patch('/forgot/password',
  basicAuthentication(),
  xPlatformValidate(),
  RequestResetAdminsValidate(),
  recaptchaValidate(),
  requestPasswordReset(),
  sendEmail(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'SEND_LINK_IF_EMAIL_EXIST', ctx.language)
  })

Router.post('/reset/password',
  basicAuthentication(),
  xPlatformValidate(),
  ResetAdminsPasswordFromEmailValidate(),
  recaptchaValidate(),
  resetPasswordFromEmail(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'GET_DATA_SUCCESS', ctx.language)
  })

Router.patch('/verify/email',
  basicAuthentication(),
  xPlatformValidate(),
  RequestResetAdminsValidate(),
  recaptchaValidate(),
  requestVerifyEmail(),
  sendEmail(),
  
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'SEND_LINK_IF_EMAIL_EXIST', ctx.language)
  })

Router.post('/verify/email',
  basicAuthentication(),
  xPlatformValidate(),
  VerifyEmailThroughEmailValidate(),
  verifyEmail(),
  
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'GET_DATA_SUCCESS', ctx.language)
  })

module.exports = Router
