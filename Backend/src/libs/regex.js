const { DateTime } = require('luxon')

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
      if (!reg.test(data) || !DateTime.fromISO(data, { zone: 'utc' }).isValid) {
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
