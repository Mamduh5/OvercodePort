// const env = process.env.NODE_ENV || 'development'
const jwt = require('jsonwebtoken')
const config = require('config')
const JWT = config.get('jwt')

const encodeJWTToken = async data => jwt.sign(data, JWT.hash, {
  algorithm: JWT.algorithm,
  ...JWT.options
})

const encodeJWTTempToken = async data =>
  jwt.sign(data, JWT.tempHash, {
    algorithm: JWT.algorithm,
    ...JWT.tempOptions // 5-minute expiration for OTP
  });


const decodeJWTToken = async token =>
  jwt.verify(
    token,
    JWT.hash,
    { algorithms: [JWT.algorithm] }, // เพิ่มอัลกอริธึมที่รองรับ
    (err, decode) => {
      if (err) return false;
      return decode;
    }
  );


const encodeJWTDynamic = (data, hash, options) => jwt.sign(data, hash, options)

const decodeJWTDynamic = (token, hash) =>
  jwt.verify(token, hash, { algorithms: [JWT.algorithm] }, (err, decode) => {
    if (err) return false
    return decode
  })

  const decodeJWTTempToken = (TempToken) =>
    jwt.verify(TempToken, JWT.tempHash, { algorithms: [JWT.algorithm] }, (err, decoded) => {
      if (err) return false;
      return decoded;
    });
  


const viewerJWT = (data, options) => jwt.decode(data, options)

module.exports = { encodeJWTToken, decodeJWTToken, encodeJWTDynamic, decodeJWTDynamic, viewerJWT, encodeJWTTempToken, decodeJWTTempToken }
