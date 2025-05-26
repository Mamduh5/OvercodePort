
const config = require('config')
const axios  = require('axios'); 

  

const fetchService = async (url, body) => {
  try {
    const params = new URLSearchParams(); 
    for (const key in body) {
      params.append(key, body[key]);
    }
    const res = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      responseType: 'text',
    });
    const responseData = new URLSearchParams(res.data);
    const result = Object.fromEntries(responseData.entries());
    return result;
  } catch (error) {
    return {
      resultCode: '-1',
      orderStatus: '',
      ref: '',
      payRef: '',
      amt: '',
      cur: '',
      errMsg: error
    };
  }
};




module.exports = { fetchService }
