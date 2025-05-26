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

Router.get('/get/password',
  basicAuthentication(),
  xPlatformValidate(),
  GetPasswordPolicy(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat(ctx.resultPasswordPolicy, 'GET_DATA_SUCCESS', ctx.language)
  })

module.exports = Router