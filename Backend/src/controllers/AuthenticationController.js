const { encodeJWTToken, encodeJWTTempToken } = require('../libs/jwt.js')
const { responseFormat } = require('../libs/formatResponse.js')

const jwtEncodeLogin = async ( ip, RefreshToken, loginType, tokenType) => {
  const jwt = await encodeJWTToken({
    key: RefreshToken,
    login_type: loginType,
    token_type: tokenType
  })
  return jwt
}

const jwtEncodeTemp = async (AdminId, ip, loginType) => {
  const payload = {
    admin_id: AdminId,  // ✅ Ensure admin_id is included
    ip: ip,
    login_type: loginType,
    token_type: 'temp'
  };

  const TempToken = await encodeJWTTempToken(payload);

  return TempToken;
};

module.exports = { jwtEncodeLogin, jwtEncodeTemp }
