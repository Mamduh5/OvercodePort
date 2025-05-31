const { DateTime } = require('luxon')

const { responsesNewSet, languages: [languagesRaw] } = require('../seeder/seeder.js')
const { throwError } = require('../libs/errorService.js')

function responseFormat(data = {}, message = 'ERROR', languages = 'EN') {
  try {
    const [filter] = responsesNewSet.filter(v => v.name === message) || []

    const { name, code, description } = filter || {}
    if (!name) return responseFormatError('Not have response message, please check seeder.')

    const [filterLanguage] = languagesRaw.data.filter(v => v.code === languages) || []

    if (!filterLanguage) return responseFormatError('Not have response languages, please check seeder.')

    const [filterDesc] = description.filter(v => v.language === filterLanguage['code']) || []

    const { language, description: Message } = filterDesc || {}
    if (!language) return responseFormatError('Not have description message, please check seeder.')

    if (code !== '0000') return responseFormatSuccess(code, 'error', Message, data)

    return responseFormatSuccess(code, 'success', Message, data)
  } catch (error) {
    throw throwError(error, 'responseFormat')
  }
}

function responseFormatError(data) {
  return { res_code: '9999', res_type: 'error', res_message: 'ERROR', res_data: data, res_time: DateTime.utc().toSeconds() }
}

function responseFormatSuccess(code, type, message, data) {
  return { res_code: code, res_type: type, res_message: message, res_data: data, res_time: DateTime.utc().toSeconds() }
}

function responseFormatValidate(errors) {
  let error = errors[0]
  error.msg.res_data = { param: error.param, ...error.msg.res_data }
  return error.msg
}

function responseFormatValidateWithRegex(errors) {
  let { msg, param } = errors[0]
  msg.res_data = { param, ...msg.res_data }
  return msg
}

module.exports = { responseFormat, responseFormatValidate, responseFormatValidateWithRegex }
