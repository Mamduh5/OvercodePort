const winston = require('winston')
const fs = require('fs')
const otpGenerator = require('otp-generator')
const { DateTime } = require('luxon')

// ================= LOG  ZONE ==================
const dir = './logs/info'
const logPath = `${dir}/${DateTime.now().setZone('Asia/Bangkok').toFormat('yyyy-MM-dd')}.log`
const throwDir = './logs/throw'
const throwLogPath = `${throwDir}/${DateTime.now().setZone('Asia/Bangkok').toFormat('yyyy-MM-dd')}.log`
const tsFormat = () => new Date().toLocaleTimeString()
const mode = process.env.NODE_ENV === 'production'

if (!fs.existsSync(dir)) {
  fs.mkdir(dir, { recursive: true }, err => {
    if (err) {
      console.error('create folder error:', err)
    } else {
      console.log('Directory created successfully')
    }
  })
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: logPath,
      level: 'info',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
      timestamp: tsFormat
    })
  ]
})

const throwLogs = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: throwLogPath,
      level: 'error',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
      timestamp: tsFormat
    })
  ]
})

const ErrorFormat = (error, res_id) => {
  const { message } = error || {}
  const devError = {
    res_id,
    res_code: error.status || error.statusCode || 500,
    res_type: 'error',
    res_stack: error.stack,
    res_message: message || error,
    res_data: {}
  }
  const prodError = {
    res_id,
    res_code: '500',
    res_message: 'Server error.',
    res_data: {}
  }
  return {
    devError,
    prodError
  }
}

const ErrorService = error => {
  const res_id = otpGenerator.generate(20)
  const logDateTime = `${DateTime.now().setZone('Asia/Bangkok').toFormat('yyyy-MM-dd')} +07:00 GMT`
  const { devError, prodError } = ErrorFormat(error, res_id)
  logger.log({
    time: logDateTime,
    level: 'info',
    ...devError
  })
  const resError = mode ? prodError : devError
  return resError
}

const throwError = (error, key) => {
  const logDateTime = `${DateTime.now().setZone('Asia/Bangkok').toFormat('yyyy-MM-dd')} +07:00 GMT`

  const { message } = error || {}
  throwLogs.log({
    time: logDateTime,
    level: 'error',
    key,
    res_message: message || error,
  })
  return error
}

const addErrorApi = result => {
  if (mode)
    logger.log({
      level: 'info',
      ...result
    })
}

const saveLogService = (logs, key) => {
  const logDateTime = `${DateTime.now().setZone('Asia/Bangkok').toFormat('yyyy-MM-dd')} +07:00 GMT`
  throwLogs.log({
    time: logDateTime,
    level: 'error',
    key,
    error: logs
  })
  return logs
}

module.exports = { ErrorService, throwError, addErrorApi, saveLogService }
