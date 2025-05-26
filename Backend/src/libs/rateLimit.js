const rateLimit = require('koa-ratelimit')
const moment = require('moment')
const env = require('config')
const { driver, duration, maxIps } = env.get('rateLimit')

const rate = new Map()
function rateLimitFunction() {
  return rateLimit({
    driver: driver,
    db: rate,
    duration: duration,
    errorMessage: {
      res_code: '429',
      res_type: 'error',
      res_message: 'Too Many Requests.',
      res_data: {},
      res_time: moment.utc().format()
    },
    id: ctx => ctx.ip,
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total'
    },
    max: maxIps,
    disableHeader: false
  })
}

module.exports = { rateLimitFunction }
