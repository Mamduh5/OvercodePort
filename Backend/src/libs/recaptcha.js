const config = require('config')
const reCAPTCHA = config.get('reCAPTCHA')
const { throwError } = require('../libs/errorService.js')
const axios = require('axios');

const verifyRecaptcha = async (token) => {
  try {
    const response = await axios.post(reCAPTCHA.VerifyURL, null, {
      params: {
        secret: reCAPTCHA.PrivatKey,
        response: token,
      },
    });
    const data = response.data;
    if (data.success) {
      return {status:true}
    } else {
      return {status:false , ression: data['error-codes'][0]}
    }
  } catch (error) {
    throw throwError(error, 'verifyRecaptcha')
  }
};

module.exports ={ verifyRecaptcha}