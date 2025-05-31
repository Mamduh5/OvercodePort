const { DateTime } = require('luxon')

function addDataDate(data, dateOfAdd) {
  let response = []
  const currectDate = DateTime.utc().toFormat('yyyy-MM-dd HH:mm:ss');
  for (let i = 0; i < dateOfAdd; i++) {
    const date = DateTime.utc(currectDate).minus({ days: i }).toFormat('yyyy-MM-dd');
    let countData = 0
    if (data[0] && data[0].dateTime === date) {
      countData = data.shift().count_data
    }
    response.push({ count_data: countData, dateTime: date })
  }
  return response
}

module.exports = { addDataDate }
