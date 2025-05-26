const router = require('koa-router')
const {
  xPlatformValidate,
  loginValidate,
  recaptchaValidate,
  tempTokenValidate,
} = require('../validators/LoginValidate.js')
const {
  tokenAuthentication,
  basicAuthentication,
  preLoginService,
  loginService,
  logoutService,
  isEmailVerify,
} = require('../middlewares/AuthenticationMiddleware.js')
const { responseFormat } = require('../libs/formatResponse.js')
const { setAction, authMonitorAdminMovement, authPreCheck, authLoggerMiddleware } = require('../middlewares/AdminsActivityLogs.js')
const { sendEmail } = require('../middlewares/SendEmailMiddleWare.js')
const { GetPasswordPolicy } = require('../middlewares/PolicyMiddleware.js')
const { requestOtpEmail2FA } = require('../middlewares/Admin2FA.js')
const Router = new router()

Router.use(authLoggerMiddleware);

Router.get('/test',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(true),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ token: true }, 'GET_DATA_SUCCESS', ctx.language)
  })

Router.post('/login',
  authPreCheck(),
  basicAuthentication(),
  xPlatformValidate(),
  loginValidate(),
  recaptchaValidate(),
  isEmailVerify(),
  setAction(1, 1),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'GET_DATA_SUCCESS', ctx.language)
  })

Router.post('/login/verify/otp',
  authPreCheck(),
  basicAuthentication(),
  xPlatformValidate(),
  tempTokenValidate(),
  loginService(),
  GetPasswordPolicy(),
  setAction(2, 2),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ FormatingTime: ctx.Time, PasswordPolicyRule: ctx.resultPasswordPolicy, emailIsVerfied: ctx.isVerified }, 'GET_DATA_SUCCESS', ctx.language)
  })

Router.get('/extend/cookie',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  setAction(4, 3),

  // setAction('LOGOUT_SUCCESS', 3),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ FormatingTime: ctx.Time }, 'EXTEND_COOKIE_SUCCESS', ctx.language)
  })


Router.get('/logout',
  authPreCheck(),
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  logoutService(),
  setAction(3, 3),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({}, 'LOGOUT_SUCCESS', ctx.language)
  })




module.exports = Router