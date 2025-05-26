const { koaBody } = require('koa-body')
const env = require('config')
const { multipart, jsonLimit, formLimit } = env.get('bodyParser')

function bodyParserFunction() {
  return koaBody({
    multipart,
    jsonLimit,
    formLimit
  })
}

module.exports = { bodyParserFunction }
