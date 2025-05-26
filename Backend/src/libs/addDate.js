const moment = require('moment')

function addDataDate(data, dateOfAdd) {
  let response = []
  const currectDate = moment.utc().format('YYYY-MM-DD')
  for (let i = 0; i < dateOfAdd; i++) {
    const date = moment.utc(currectDate).subtract(i, 'days').format('YYYY-MM-DD')
    let countData = 0
    if (data[0] && data[0].dateTime === date) {
      countData = data.shift().count_data
    }
    response.push({ count_data: countData, dateTime: date })
  }
  return response
}

module.exports = { addDataDate }
