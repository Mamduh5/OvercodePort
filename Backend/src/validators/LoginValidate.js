const config = require('config')
const { responseFormat, responseFormatValidate, responseFormatValidateWithRegex } = require('../libs/formatResponse.js')
const { throwError } = require('../libs/errorService.js')
const { decodeJWTTempToken, decodeJWTDynamic } = require('../libs/jwt.js')
const { Argon2verifyPassword } = require('../libs/password.js')
const { knex } = require('../libs/knex.js');
const { ADMINS, ADMIN_2FA_REQUEST, AUTH_LOGIN_LOGS } = require('../enum/index.js');
const ValidateSchema = require('./schemas/login/loginValidateSchema.js')
const otpLogInSchema = require('./schemas/login/otpLoginValidateSchema.js')
const UserUpdateInfoSchema = require('./schemas/admins/UpdateUserInfoValidateSchema.js');
const jwt = config.get('jwt')
const { verifyRecaptcha } = require('../libs/recaptcha.js')
const { DateTime } = require('luxon')

const xPlatformValidate = () => async (ctx, next) => {
  try {
    const language = ctx.language
    const platform = ctx.request.headers['x-platform']
    if (!platform) {
      ctx.status = 400;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Invalid Platform";
    }
    ctx.checkHeaders('x-platform', responseFormat({}, 'HEADER_REQUIRED_PLATFORM', language)).notEmpty()
    let errors = await ctx.validationErrors()
    if (errors) {
      ctx.body = responseFormatValidate(errors)
      return
    }
    const platforms = ['IOS', 'ANDROID', 'WEB', 'MOBILE', 'SOCKET']
    const isPlatformValid = platforms.includes(platform)
    if (!isPlatformValid) {
      ctx.status = 401;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Invalid Platform";
      ctx.body = responseFormat({ param: `x-platform = ['IOS', 'ANDROID', 'WEB', 'MOBILE', 'SOCKET', 'OTHER']` }, 'INVALID_VALUES', language)
      return;
    }
    ctx.platform = platform
    return next()
  } catch (error) {
    throw throwError(error, 'xPlatformValidate')
  }
}



const loginValidate = () => async (ctx, next) => {
  try {
    const { error, value } = ValidateSchema.loginValidateSchema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      ctx.status = 400;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Failed on validate values";
      const errors = error.details.map((err) => (
        {
          field: err.path.join('.'),
          value: err.context?.value || '',
          message: err.message,
        }));
      ctx.body = responseFormat({ [errors[0].field]: errors[0].value, }, errors[0].message, ctx.language)
      return;
    } else if (!value) {
      ctx.status = 400;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Someting went wrong";
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language);
      return;
    }
    const { Email, Password } = value || {};

    const findUser = await knex(ADMINS).select('*')
      .where({ email: Email })

    if (!findUser[0]) {

      ctx.status = 404;
      ctx.action = "LOGIN_FAILED";
      ctx.reason_of_failure = "user not found";
      ctx.body = responseFormat({}, 'DONT_FOUND_USER', ctx.language)
      return;
    }

    ctx.password_hash = findUser[0].password_hash
    ctx.refresh_token = findUser[0].refresh_token

    const isYourAccountHaveBeenBlocked = await isBlocked(ctx, findUser[0].email);

    if (isYourAccountHaveBeenBlocked) {
      ctx.status = 401;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Account Blocked 30 minutes";
      ctx.admin_id = findUser[0].admin_id
      ctx.email = findUser[0].email
      ctx.body = responseFormat({}, 'YOU_ARE_BLOCKED_PLS_WAIT', ctx.language);
      return;
    }

    const isPasswordValid = await Argon2verifyPassword(Password, ctx.password_hash);

    if (!isPasswordValid) {

      ctx.status = 404;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Incorrect Password";
      ctx.admin_id = findUser[0].admin_id
      ctx.email = findUser[0].email

      const TotalFailed = await failedAttempCount(ctx, ctx.email, ctx.reason_of_failure);

      const totalFailedCount = parseInt(TotalFailed, 10);

      if (totalFailedCount === 1) {
        ctx.body = responseFormat({}, 'WRONG_PASSWORD_WARNING_BEFORE_BLOCK', ctx.language);
      }
      else if (totalFailedCount >= 2) {
        ctx.failed_attempt_count = 999;
        ctx.body = responseFormat({}, 'BLOCKED_AFTER_THREE_PASSWORD_FAILED_ATTEMP', ctx.language);
      } else {
        ctx.body = responseFormat({}, 'DONT_FOUND_USER', ctx.language);
      }

      return;
    }
    ctx.user = findUser;
    ctx.admin_id = findUser[0].admin_id

    await notBlockedAndPassowrdCorrect(isYourAccountHaveBeenBlocked, findUser[0].email);

    await next();
  } catch (error) { throw throwError(error, 'loginValidate') }
};

const failedAttempCount = async (ctx, Email, ReasonOfFailure) => {

  const isFailed = await knex(AUTH_LOGIN_LOGS)
    .select('failed_attempt_count')
    .where({ email: Email, request_from_portal: 1 })
    .orderBy('timestamp', 'desc')
    .first();

  if (isFailed && isFailed.failed_attempt_count > 0) {
    const failedCount = await knex(AUTH_LOGIN_LOGS)
      .sum('failed_attempt_count as total_failed_attempts')
      .where({ email: Email, reason_of_failure: ReasonOfFailure, request_from_portal: 1 })
      .orderBy('timestamp', 'desc')
      .first();

    const totalAttempFailed = failedCount.total_failed_attempts || 0;
    ctx.failed_attempt_count = 1;

    return totalAttempFailed;
  }

  ctx.failed_attempt_count = 1;

}

const isBlocked = async (ctx, Email) => {

  const currentTime = DateTime.utc();


  const ReasonOfFailure = "Incorrect Password";
  const blockedEntry = await knex(AUTH_LOGIN_LOGS)
    .select('timestamp')
    .where({ email: Email, reason_of_failure: ReasonOfFailure, failed_attempt_count: 999, request_from_portal: 1 })
    .orderBy('timestamp', 'desc')
    .first();

  if (blockedEntry) {

    const blockedTime = DateTime.fromJSDate(blockedEntry.timestamp).toUTC();


    if (currentTime.diff(blockedTime, 'minutes') < 30) {
      return true;
    }
    else {
      await knex(AUTH_LOGIN_LOGS)
        .where({ email: Email, reason_of_failure: ReasonOfFailure, request_from_portal: 1 })
        .update({ failed_attempt_count: 0 })
    }

  }

  return false;


}

const notBlockedAndPassowrdCorrect = async (youAreBlock, Email) => {

  if (youAreBlock === false) {
    await knex(AUTH_LOGIN_LOGS)
      .where({ email: Email, failed_attempt_count: 1, request_from_portal: 1 })
      .update('failed_attempt_count', 0)
  }
}

const tempTokenValidate = () => async (ctx, next) => {
  try {
    const { error, value } = otpLogInSchema.otpLogInSchema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      ctx.status = 400;
      ctx.action = 'LOGIN_2FA_FAILED';
      ctx.reason_of_failure = "Failed on validate values";
      const errors = error.details.map(err => ({
        field: err.path.join('.'),
        value: err.context?.value || '',
        message: err.message
      }));
      ctx.body = responseFormat({ [errors[0].field]: errors[0].value }, errors[0].message, ctx.language);
      return;
    } else if (!value) {
      ctx.status = 400;
      ctx.action = 'LOGIN_2FA_FAILED';
      ctx.reason_of_failure = "Someting went wrong";
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language);
      return;
    }
    const { otp, TempToken, RefCode } = value || {};

    const decode = decodeJWTTempToken(TempToken);
    if (!decode) {
      ctx.status = 401;
      ctx.action = 'LOGIN_2FA_FAILED';
      ctx.reason_of_failure = "Temp Token is Invalid";
      ctx.body = responseFormat({}, 'INVALID_TOKEN', ctx.language);
      return;
    }
    const { admin_id: AdminId } = decode;

    if (shouldValidateOTP(0)) {
      const otpValidationResult = await validateOTP(ctx, AdminId, otp, RefCode);
      if (otpValidationResult) return otpValidationResult;
    }

    const userData = await fetchTempTokenData(ctx, AdminId);

    ctx.admin_id = userData[0].admin_id
    ctx.password_hash = userData[0].password_hash
    ctx.refresh_token = userData[0].refresh_token
    ctx.user = userData;
    ctx.email = userData[0].email
    await next();
  } catch (error) {
    throw throwError(error, 'tempTokenValidate');
  }
};

const fetchTempTokenData = async (ctx, AdminId) => {
  // ✅ Fetch user data (Needed for next middleware)
  const findUser = await knex(ADMINS).select('*')
    .where({ [`${ADMINS}.admin_id`]: AdminId })

  if (!findUser[0]) {
    ctx.status = 404;
    ctx.action = 'LOGIN_2FA_FAILED';
    ctx.reason_of_failure = "Admin id from temp token is invalid";
    ctx.admin_id = AdminId;
    ctx.body = responseFormat({}, 'DONT_FOUND_USER', ctx.language);
    return;
  }

  return findUser;
}

function shouldValidateOTP(i) {
  switch (i) {
    case 1:
      return process.env.NODE_ENV !== 'localhost' && process.env.NODE_ENV !== 'developer';
    case 2:
      return true;
    default:
      return process.env.NODE_ENV !== 'localhost';
  }
}

const validateOTP = async (ctx, AdminId, otp, RefCode) => {
  const storedOTP = await knex(ADMIN_2FA_REQUEST)
    .select('otp_code', 'otp_code_status', 'expired_at')
    .where({ admin_id: AdminId, otp_code: otp, otp_ref: RefCode, topic_of_request: 1, request_coming_from: 1 })
    .first();

  if (!storedOTP || storedOTP.otp_code !== otp) {
    const failedCount = await knex(ADMIN_2FA_REQUEST)
      .select('verify_otp_failed_attempt_count')
      .where({ admin_id: AdminId, otp_ref: RefCode, request_coming_from: 1 })
      .first();

    if (!failedCount) {
      await knex(ADMIN_2FA_REQUEST).insert({
        admin_id: AdminId,
        topic_of_request: 3,
        otp_code_status: 4,
        otp_code: otp,
        otp_ref: RefCode,
        attempt_count: 1,
        status: 402,
        request_coming_from: 1,
        created_at: DateTime.utc().toFormat('yyyy-MM-dd HH:mm:ss'),
      });
    } else {
      const newFailedCount = failedCount.verify_otp_failed_attempt_count + 1;
      await knex(ADMIN_2FA_REQUEST)
        .where({ admin_id: AdminId, otp_ref: RefCode, request_coming_from: 1 })
        .update({ verify_otp_failed_attempt_count: newFailedCount });

      if (newFailedCount === 2) {
        ctx.status = 404;
        ctx.action = 'LOGIN_2FA_FAILED';
        ctx.reason_of_failure = "Otp is invalid";
        ctx.admin_id = AdminId;
        ctx.body = responseFormat({}, 'WRONG_OTP_WARNING_BEFORE_BLOCK', ctx.language);
        return ctx.body;
      } else if (newFailedCount >= 3) {
        ctx.status = 404;
        ctx.action = 'LOGIN_2FA_FAILED';
        ctx.reason_of_failure = "Otp is invalid";
        ctx.admin_id = AdminId;
        ctx.body = responseFormat({}, 'BLOCKED_AFTER_THREE_OTP_FAILED_ATTEMP', ctx.language);
        return ctx.body;
      }
    }

    ctx.status = 404;
    ctx.action = 'LOGIN_2FA_FAILED';
    ctx.reason_of_failure = "Otp is invalid";
    ctx.admin_id = AdminId;
    ctx.body = responseFormat({}, 'OTP_NOT_FOUND', ctx.language);
    return ctx.body;
  }

  if (storedOTP.otp_code_status === 3) {
    ctx.body = responseFormat({}, 'OTP_EXPIRE', ctx.language);
    return;
  }
  const currentTime = DateTime.utc();
  const otpExpiry = DateTime.fromJSDate(storedOTP.expired_at).toUTC();
  if (currentTime > otpExpiry) {
    await knex(ADMIN_2FA_REQUEST)
      .where({ admin_id: AdminId, topic_of_request: 1, request_coming_from: 1 })
      .update({ otp_code_status: 3 });
    ctx.body = responseFormat({}, 'OTP_EXPIRE', ctx.language);
    return;
  }

  // If OTP is valid, mark it as verified (status 2)
  await knex(ADMIN_2FA_REQUEST)
    .where({ admin_id: AdminId, topic_of_request: 1, otp_code: otp, otp_code_status: 1, request_coming_from: 1 })
    .update({ otp_code_status: 2 });


}

const recaptchaValidate = () => async (ctx, next) => {
  try {
    if (process.env.NODE_ENV !== 'localhost' && process.env.NODE_ENV !== 'developer') {
      let { TokenRecaptcha } = ctx.request.body
      const { status, ression } = await verifyRecaptcha(TokenRecaptcha)
      if (status === false) {
        ctx.status = 400;
        ctx.reason_of_failure = "Invalid Recaptcha";
        ctx.action = 'LOGIN_FAILED';
        ctx.body = responseFormat({ ression }, 'ERROR_RECAPTCHA', ctx.language)
        return;
      }
    }
    await next();
  } catch (error) { throw throwError(error, 'recaptchaValidate') }
};


const UpdateUserInfoValidate = () => async (ctx, next) => {
  try {
    const { error, value } = UserUpdateInfoSchema.updateUserInfoValidateSchema.validate(
      ctx.request.body,
      { abortEarly: false }
    );
    if (error) {
      const errors = error.details.map((err) => ({
        field: err.path.join('.'),
        value: err.context?.value || '',
        message: err.message,
      }));
      ctx.body = responseFormat({ [errors[0].field]: errors[0].value }, errors[0].message, ctx.language);
      return;
    } else if (!value) {
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language)
      return;
    }
    const admin_id = ctx.admin_id;
    const findUser = await knex(ADMINS).select('*').where({ admin_id }).first();
    if (!findUser) {
      ctx.body = responseFormat({}, 'DONT_FOUND_USER', ctx.language);
      return;
    }
    const { status: status_database, ...userData } = findUser;
    if (status_database !== 102) {
      ctx.body = responseFormat({}, 'USER_IS_BLOCKED', ctx.language);
      return;
    }
    ctx.user = userData;
    ctx.validatedData = value;
    return next();
  } catch (error) {
    throw throwError(error, 'UpdateUserInfoValidate');
  }
};

const forgotPasswordChangeValidate = () => async (ctx, next) => {
  try {
    const language = ctx.language
    ctx.checkBody('newpassword', responseFormat({}, 'MISSING_REQUIRED_VALUES', language)).notEmpty()
    ctx.checkBody('newpassword', responseFormat({ error: 'Max Length: 100' }, 'CHARACTER_OVER_LENGTH', language)).len({ max: 100 })
    let errors = await ctx.validationErrors()
    if (Object.keys(errors).length) {
      ctx.body = responseFormatValidateWithRegex(errors)
      return;
    }
    return next()
  } catch (error) {
    throw throwError(error, 'forgotPasswordChangeValidate')
  }
}

module.exports = {
  xPlatformValidate,
  loginValidate,
  recaptchaValidate,
  UpdateUserInfoValidate,
  forgotPasswordChangeValidate,
  tempTokenValidate,
  isBlocked
}
