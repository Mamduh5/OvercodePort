const { Base64 } = require('js-base64')

const encode = string => {
  return Base64.encode(string)
}

const decode = async base64string => {
  return Base64.decode(base64string)
}

const encode_without_async = string => {
  return Base64.encode(string)
}

module.exports = { encode, decode, encode_without_async }
