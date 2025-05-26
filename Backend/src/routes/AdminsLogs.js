const router = require('koa-router')
const {
  xPlatformValidate,
} = require('../validators/LoginValidate.js')
const {
  basicAuthentication,
  tokenAuthentication,
} = require('../middlewares/AuthenticationMiddleware.js')
const { responseFormat } = require('../libs/formatResponse.js')
const { displayLoginLogs, displayAdminChangeLogs } = require('../middlewares/AdminsActivityLogs.js')
const { LogLoginValidate, adminChangeValidate, PermissionValidate } = require('../validators/LogsValidate.js')
const Router = new router()

Router.get('/admins/data',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  adminChangeValidate(),
  displayAdminChangeLogs(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ data: ctx.result }, 'GET_DATA_SUCCESS', ctx.language)
  })

Router.get('/login/data',
  basicAuthentication(),
  xPlatformValidate(),
  tokenAuthentication(),
  LogLoginValidate(),
  displayLoginLogs(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ data: ctx.result }, 'GET_DATA_SUCCESS', ctx.language)
  })

// Router.get('/permission/data',
//   basicAuthentication(),
//   xPlatformValidate(),
//   PermissionValidate(),
//   
//   tokenAuthentication(),
//   displayPermissionLogs(),
//   async ctx => {
//     ctx.status = 200
//     ctx.body = responseFormat({ data: ctx.result }, 'GET_DATA_SUCCESS', ctx.language)
//   })


module.exports = Router