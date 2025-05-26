const router = require('koa-router')
const {
  xPlatformValidate,
} = require('../validators/LoginValidate.js')
const {
  basicAuthentication,
  tokenAuthentication,
} = require('../middlewares/AuthenticationMiddleware.js')
const { responseFormat } = require('../libs/formatResponse.js')
const { GetPasswordPolicy } = require('../middlewares/PolicyMiddleware.js')
const Router = new router()

Router.get('/',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  GetPasswordPolicy(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ PasswordPolicyRule: ctx.resultPasswordPolicy }, 'GET_DATA_SUCCESS', ctx.language)
  })

module.exports = Router