/**
 * Module dependencies.
 */

const Counter = require('passthrough-counter')
const humanize = require('humanize-number')
const bytes = require('bytes')
const chalk = require('chalk')
const { DateTime } = require('luxon')

const { addErrorApi } = require('./errorService')

/**
 * Color map.
 */

const colorCodes = {
  7: 'magenta',
  5: 'red',
  4: 'yellow',
  3: 'cyan',
  2: 'green',
  1: 'green',
  0: 'yellow'
}

/**
 * Development logger.
 */

const loggerRes = () => {
  return async function logger(ctx, next) {
    // request
    const start = Date.now()
    console.log('  ' + chalk.gray('-->') + ' ' + chalk.bold('%s') + ' ' + chalk.gray('%s') + ' ' + chalk.cyan(DateTime.now().setZone('Asia/Bangkok').toFormat('yyyy-MM-dd')) + ' ' + chalk.gray('+7:00 TH'), ctx.method, ctx.originalUrl)

    try {
      await next()
    } catch (err) {
      // log uncaught downstream errors
      log(ctx, start, null, err)
      throw err
    }
    const length = ctx.response.length
    const body = ctx.body
    let counter
    if (length == null && body?.readable) {
      const counter = Counter(); // แยกการสร้างตัวแปร counter ออกมาชัดเจน
      ctx.body = body.pipe(counter).on('error', ctx.onerror);
    }
    const res = ctx.res

    const onfinish = done.bind(null, 'finish')
    const onclose = done.bind(null, 'close')

    res.once('finish', onfinish)
    res.once('close', onclose)

    function done(event) {
      res.removeListener('finish', onfinish)
      res.removeListener('close', onclose)
      log(ctx, start, counter ? counter.length : length, null, event)
    }
  }
}

/**
 * Log helper.
 */

const log = (ctx, start, len, err, event) => {
  // get the status code of the response
  let status;

if (err) {
    if (err.isBoom) {
        status = err.output.statusCode;
    } else {
        status = err.status || 500;
    }
} else {
    status = ctx.status || 404;
}
  const s = (status / 100) | 0
  const color = Object.hasOwn(colorCodes, s) ? colorCodes[s] : 0;

  let length
  if (~[204, 205, 304].indexOf(status)) {
    length = ''
  } else if (len == null) {
    length = '-'
  } else {
    length = bytes(len).toLowerCase()
  }

  const upstream = getUpstream(err, event);
  const timeStart = time(start)
  const results = getResults(ctx, timeStart)
  addErrorApi(results)
  console.log('  ' + upstream + ' ' + chalk.bold('%s') + ' ' + chalk.gray('%s') + ' ' + chalk[color]('%s') + ' ' + chalk.gray('%s') + ' ' + chalk.gray('%s'), ctx.method, ctx.originalUrl, status, timeStart, length)
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

const time = start => {
  const delta = Date.now() - start
  return humanize(delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's')
}

const getUpstream = (err, event) => {
  if (err) {
      return chalk.red('xxx');
  }
  if (event === 'close') {
      return chalk.yellow('-x-');
  }
  return chalk.gray('<--');
};


const getResults = (ctx, timeStart) => {
  const connection = ctx.req?.connection;
  return {
    method: ctx.req?.method,
    url: ctx.req?.url,
    statusCode: ctx.res?.statusCode,
    responseTime: timeStart,
    headers: ctx.req?.headers,
    body: ctx.request?.body,
    remoteAddress: connection?.remoteAddress,
    remotePort: connection?.remotePort,
  };
};

module.exports = { loggerRes }
