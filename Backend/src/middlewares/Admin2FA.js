const config = require('config'); // Importing the config library
const otpGenerator = require('otp-generator');
const { knex } = require('../libs/knex.js');
const { ADMINS, REQUEST_SENDING_EMAIL, ADMIN_2FA_REQUEST } = require('../enum/index.js');
const { responseFormat } = require('../libs/formatResponse.js');
const { requestOtpEmailHTML, requestEnable2FAEmailHTML } = require('../email/emailSendertext.js');
const crypto = require('crypto');
const { DateTime } = require('luxon')
const { throwError } = require('../libs/errorService.js');

const admin2FAStatus = () => async (ctx, next) => {
  try {
    const adminId = ctx.admin_id;

    const requestData = await knex('admins')
      .select(
        'admins.admin_id',
        'admins.is_2fa_active',
        'request_sending_email.topic_of_request'
      )
      .leftJoin('request_sending_email', function () {
        this.on('admins.admin_id', '=', 'request_sending_email.admin_id')
          .andOn('request_sending_email.status', '=', knex.raw('102'));
      })
      .where('admins.admin_id', adminId)
      .orderBy('request_sending_email.created_at', 'desc')
      .first();

    ctx.result = {
      Factor: "Email",
      status: requestData ? requestData.is_2fa_active === 1 : false,
      Requested: requestData?.topic_of_request === 3
    };

    return next();
  } catch (error) {
    throw throwError(error, 'admin2FAStatus');
  }
};

const requestEnable2FA = () => async (ctx, next) => {
  try {
    const adminId = ctx.admin_id;

    const adminsData = await knex(ADMINS)
      .where({ admin_id: adminId })
      .first();

    if (adminsData.email_verification !== 1) {
      ctx.body = responseFormat({}, 'UNVERIFIED_EMAIL', ctx.language);
      return;
    }

    if (adminsData.is_2fa_active === 1) {
      ctx.body = responseFormat({}, '2FA_ALREADY_ENABLED', ctx.language);
      return;
    }

    const adminName = adminsData.first_name;
    const Email = adminsData.email;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = DateTime.utc().plus({ hours: 1 }).toFormat('yyyy-MM-dd HH:mm:ss');

    await knex(REQUEST_SENDING_EMAIL).update({
      status: 402
    })
      .where({
        admin_id: adminId, topic_of_request: 3
      })

    await knex(REQUEST_SENDING_EMAIL).insert({
      admin_id: adminId,
      topic_of_request: 3,
      email: Email,
      reset_token: resetTokenHash,
      reset_token_expiry_at: resetTokenExpiry,
      status: 102,
    });
    const FrontendURL = config.get('VerifyEnable2FAURL.host');
    const resetLink = `${FrontendURL}?token=${resetToken}`;
    const emailBody = requestEnable2FAEmailHTML(adminName, resetLink);

    ctx.admin_id = adminId;
    ctx.sendingEmail = {
      to: Email,
      subject: 'Enable 2FA',
      body: emailBody,
    };

    await next();
  } catch (error) {
    throw throwError(error, 'enable2FA');
  }
}

const confirmEnable2FA = () => async (ctx, next) => {
  try {
    const adminId = ctx.admin_id;
    const Email = ctx.email;
    const Token = ctx.resetTokenHash;

    const requestData = await knex(REQUEST_SENDING_EMAIL)
      .where({ admin_id: adminId, email: Email, reset_token: Token, topic_of_request: 3, status: 102 })
      .first();

    const currentTime = DateTime.utc();
    const resetTokenExpiry = DateTime.fromJSDate(requestData.reset_token_expiry_at).toUTC();
    if (currentTime > resetTokenExpiry) {
      ctx.body = responseFormat({}, 'RESET_TOKEN_EXPIRE', ctx.language);
      return;
    }
    await knex(ADMINS)
      .where({ admin_id: adminId, email: Email })
      .update({
        is_2fa_active: 1,
        updated_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      });
    await knex(REQUEST_SENDING_EMAIL).where({
      admin_id: adminId,
      email: Email,
      topic_of_request: 3,
    }).del();
    ctx.admin_id = adminId;
    await next();
  } catch (error) {
    throw throwError(error, 'confirmEnable2FA');
  }
}

const disable2FA = () => async (ctx, next) => {
  try {
    const adminId = ctx.admin_id;
    await knex(ADMINS)
      .where({ admin_id: adminId })
      .update({
        is_2fa_active: 0,
        updated_at: DateTime.utc().toFormat('yyyy-MM-dd HH:mm:ss'),
      });

    return next();
  } catch (error) {
    throw throwError(error, 'disable2FA');
  }
}

const requestOtpEmail2FA = () => async (ctx, next) => {
  try {
    const adminId = ctx.admin_id;

    const adminsData = await knex(ADMINS)
      .where({ admin_id: adminId })
      .first();

    if (adminsData.is_2fa_active !== 1) {
      ctx.body = responseFormat({}, 'HAVE_TO_ENABLED_2FA', ctx.language);
      return;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const ref_code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const adminName = adminsData.first_name;
    const Email = adminsData.email;
    const currentTime = DateTime.utc();
    const otpExpiry = DateTime.utc().plus({ minutes: 5 }).toFormat('yyyy-MM-dd HH:mm:ss');
    const threeMinutesAgo = currentTime.minus({ minutes: 3 }).toFormat('yyyy-MM-dd HH:mm:ss');

    const attemptSumxMin = await knex(ADMIN_2FA_REQUEST)
      .where({ admin_id: adminId, topic_of_request: 1, otp_code_status: 1, request_coming_from: 1 })
      .andWhere('created_at', '>=', threeMinutesAgo)
      .sum('attempt_count as total_attempts_xmin')
      .first();

    const totalAttemptsxMin = attemptSumxMin.total_attempts_xmin || 0;

    const blockedEntry = await knex(ADMIN_2FA_REQUEST)
      .select('created_at')
      .where({ admin_id: adminId, topic_of_request: 1, otp_code_status: 999, request_coming_from: 1 })
      .orderBy('created_at', 'desc')
      .first();

    if (blockedEntry) {
      const blockedTime = DateTime.fromJSDate(blockedEntry.created_at).toUTC();
      if (currentTime.diff(blockedTime, 'minutes') < 30) {
        ctx.body = responseFormat({}, 'BLOCKED_30_MINUTES', ctx.language);
        return;
      } else {
        await knex(ADMIN_2FA_REQUEST)
          .where({ admin_id: adminId, topic_of_request: 1, otp_code_status: 999, request_coming_from: 1 })
          .del();
      }
    }

    if (totalAttemptsxMin >= 5) {
      await knex(ADMIN_2FA_REQUEST).insert({
        admin_id: adminId,
        topic_of_request: 1,
        attempt_count: 0,
        otp_code_status: 999,
        created_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss')
      });

      ctx.body = responseFormat({}, 'MANY_REQUEST_VERIFY', ctx.language);
      return;
    }

    // Get the latest OTP record
    const latestOTP = await knex(ADMIN_2FA_REQUEST)
      .select('created_at', 'attempt_count', 'otp_code', 'otp_ref')
      .where({ admin_id: adminId, topic_of_request: 1, otp_code_status: 1, request_coming_from: 1 })
      .orderBy('created_at', 'desc')
      .first();

    if (latestOTP) {
      const requestTime = DateTime.fromJSDate(latestOTP.created_at).toUTC();
      const timeDiff = currentTime.diff(requestTime, 'seconds').seconds;

      const cooldownTimeOtp = 300;
      const remainingTimeOtp = Math.max(cooldownTimeOtp - timeDiff, 0);

      const cooldownTime = 20;
      const remainingTime = Math.max(cooldownTime - timeDiff, 0);

      if (timeDiff < cooldownTime) {
        ctx.body = responseFormat({ TempToken: ctx.jwtTemp, RefCode: latestOTP.otp_ref, RemainingTime: remainingTime, OtpExpireIn: remainingTimeOtp }, 'PLS_WAIT_TWENTY_SECONDS', ctx.language);
        return;
      } else {
        await knex(ADMIN_2FA_REQUEST)
          .update({ status: 402 })
          .where({ admin_id: adminId, status: 102, topic_of_request: 1, request_coming_from: 1 });

        // Insert new OTP request
        await knex(ADMIN_2FA_REQUEST).insert({
          verify_otp_failed_attempt_count: 0,
          admin_id: adminId,
          topic_of_request: 1,
          attempt_count: 1,
          otp_code_status: 1,
          otp_ref: ref_code,
          expired_at: otpExpiry,
          otp_code: otp,
          status: 102,
          request_coming_from: 1,
          created_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss')
        });
      }
    } else {
      await knex(ADMIN_2FA_REQUEST).insert({
        admin_id: adminId,
        verify_otp_failed_attempt_count: 0,
        topic_of_request: 1,
        attempt_count: 1,
        otp_code_status: 1,
        expired_at: otpExpiry,
        otp_code: otp,
        otp_ref: ref_code,
        status: 102,
        request_coming_from: 1,
        created_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss')
      });

      ctx.remainingTime = 20;
    }

    ctx.request_time = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
    ctx.remainingTime = 20;
    ctx.otpRemainingTime = 300;
    ctx.ref_code = ref_code
    const emailBody = requestOtpEmailHTML(adminName, otp, ref_code, "#675dd8");

    ctx.admin_id = adminId;
    ctx.sendingEmail = {
      to: Email,
      subject: 'OTP for 2FA',
      body: emailBody,
    };

    await next();
  } catch (error) {
    throw throwError(error, 'requestOtpEmail2FA');
  }
};

const checkOtpExpiredEmail2FA = () => async (ctx, next) => {
  const adminId = ctx.admin_id;

  const otpData = await knex(ADMIN_2FA_REQUEST)
    .where({ admin_id: adminId, topic_of_request: 1 });

  if (!otpData.length) {
    return next();
  }

  const currentTime = DateTime.utc();

  const expiredOtps = otpData.filter(otp => DateTime.fromJSDate(otp.expired_at).toUTC() < currentTime);

  if (expiredOtps.some(otp => otp.otp_code_status === 3)) {
    ctx.body = responseFormat({}, 'OTP_EXPIRE', ctx.language);
    return;
  }

  if (expiredOtps.length > 0) {
    await knex(ADMIN_2FA_REQUEST)
      .where({ admin_id: adminId, topic_of_request: 1 })
      .whereIn("otp_code", expiredOtps.map(otp => otp.otp_code))
      .update({ otp_code_status: 3 });

    ctx.body = responseFormat({}, 'OTP_EXPIRE', ctx.language);
    return;
  }

  return next();
};

const confirmOtpEmail2FA = () => async (ctx, next) => {
  try {
    const adminId = ctx.admin_id;
    const otp = ctx.request.body.otp;
    const RefCode = ctx.request.body.RefCode;
    const otpData = await knex(ADMIN_2FA_REQUEST)
      .select('otp_code', 'expired_at', 'otp_code_status')
      .where({ admin_id: adminId, otp_code: otp, topic_of_request: 1, status: 102, otp_ref: RefCode, request_coming_from: 1 })
      .first();

    if (!otpData || otpData.otp_code_status === 2 || otpData.otp_code !== otp) {
      const failedCount = await knex(ADMIN_2FA_REQUEST)
        .select('verify_otp_failed_attempt_count')
        .where({ admin_id: adminId, otp_ref: RefCode, request_coming_from: 1 })
        .first();

      if (!failedCount) {
        await knex(ADMIN_2FA_REQUEST).insert({
          admin_id: adminId,
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
          .where({ admin_id: adminId, otp_ref: RefCode, request_coming_from: 1 })
          .update({ verify_otp_failed_attempt_count: newFailedCount });

        if (newFailedCount === 2) {
          ctx.body = responseFormat({}, 'WRONG_OTP_WARNING_BEFORE_BLOCK', ctx.language);
          return;
        } else if (newFailedCount >= 3) {
          ctx.body = responseFormat({}, 'BLOCKED_AFTER_THREE_OTP_FAILED_ATTEMP', ctx.language);
          return;
        }
      }
      ctx.body = responseFormat({}, 'OTP_NOT_FOUND', ctx.language);
      return;
    }

    if (otpData.otp_code_status === 3) {
      ctx.body = responseFormat({}, 'OTP_EXPIRE', ctx.language);
      return;
    }

    const currentTime = DateTime.utc();
    const otpExpiry = DateTime.fromJSDate(otpData.expired_at).toUTC();
    if (currentTime > otpExpiry) {
      await knex(ADMIN_2FA_REQUEST)
        .where({ admin_id: adminId, topic_of_request: 1, request_coming_from: 1 })
        .update({ otp_code_status: 3 });
      ctx.body = responseFormat({}, 'OTP_EXPIRE', ctx.language);
      return;
    }

    await knex(ADMIN_2FA_REQUEST)
      .where({ admin_id: adminId, topic_of_request: 1, otp_code: otp, request_coming_from: 1 })
      .update({ otp_code_status: 2 });

    ctx.admin_id = adminId;
    await next();
  } catch (error) {
    throw throwError(error, 'confirmOtpEmail2FA');
  }
};

module.exports = {
  requestEnable2FA, confirmEnable2FA, requestOtpEmail2FA, confirmOtpEmail2FA, checkOtpExpiredEmail2FA, disable2FA, admin2FAStatus
}