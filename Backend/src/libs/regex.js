const moment = require('moment')

const AssetRegexValidate = errors => {
  let error = errors || []
  return (data, params, message, reg) => {
    if(typeof params == 'undefined'){
      return error[0] ? error : undefined
    }else{
      if (!reg.test(data)) {
        error.push({
          param: params,
          msg: message
        })
      }
      return error[0] ? error : undefined
    }
}
}

const AssetRegexValidateDateTime = errors => {
  let error = errors || []
  return (data, params, message, reg) => {
    if(typeof params == 'undefined'){
      return error[0] ? error : undefined
    }else{
      if (!reg.test(data) || !moment.utc(data, moment.ISO_8601, true).isValid()) {
        error.push({
          param: params,
          msg: message
        })
      }
      return error[0] ? error : undefined
    }
  }
}

module.exports = { AssetRegexValidate, AssetRegexValidateDateTime }
