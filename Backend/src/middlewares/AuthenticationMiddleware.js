const { DateTime } = require('luxon')
const config = require('config')
const basicAuth = require('basic-auth')
const { responseFormat } = require('../libs/formatResponse.js')
const { throwError } = require('../libs/errorService.js')
const { languageProject } = require('../libs/language')
const { decodeJWTDynamic } = require('../libs/jwt.js')
const { 
  jwtEncodeLogin,
  jwtEncodeTemp,
} = require('../controllers/AuthenticationController.js')
const { knex } = require('../libs/knex.js');
const authen = config.get('basicAuth')
const jwt = config.get('jwt')
const cookieTiming = config.get('cookie')
const cache = require('../libs/redis.js')
const {
  ADMINS,
  REQUEST_SENDING_EMAIL,
  ADMIN_DATA_TRACKING
} = require('../enum/index.js')
const { getQueryDynamiCMD } = require('../../src/libs/knex.js')
const { Argon2hashPassword, Argon2verifyPassword } = require('../libs/password.js')
const { generateResetEmailHTML, generateEmailConfirmationHTML } = require('../email/emailSendertext.js');
const crypto = require('crypto');
const { ExtendCookie } = require('../libs/cookie.js')
const basicAuthentication = () => async (ctx, next) => {
  try {
    const language = ctx.request.headers['accept-language']
    if (!language) {
      ctx.status = 400;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Missing accept-language header";
      ctx.body = responseFormat({ param: 'header', error: 'accept-language' }, 'MISSING_REQUIRED_VALUES', 'EN')
      return;
    }
    const modelLanguage = await languageProject(language)
    let credentials = basicAuth(ctx.req)
    if (!credentials || credentials.name !== authen.username || credentials.pass !== authen.password) {
      ctx.status = 401
      ctx.set('WWW-Authenticate', 'Basic')
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Basic Authentication failed";
      ctx.body = responseFormat({}, 'BASIC_AUTH_FAIL', modelLanguage)
      return;
    } else {
      ctx.language = modelLanguage
      return next()
    }
  } catch (error) {
    throw throwError(error, 'basicAuthentication')
  }
}


const loginService = () => async (ctx, next) => {
  const ips = ctx.ip
  const platform = ctx.platform
  const jwt = await jwtEncodeLogin(ips, ctx.refresh_token, 'NORMAL', platform)
  const response = await ExtendCookie()
  ctx.Time = response
  ctx.cookies.set("x-access-token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV != 'localhost',
    sameSite: process.env.NODE_ENV === 'localhost' ? "Lax" : "None",
    maxAge: cookieTiming.resetTime.minute * cookieTiming.resetTime.multiplierSecond * cookieTiming.resetTime.multiplierMilisecond,
  });
  ctx.jwt = jwt
  return next()
}

const logoutService = () => async (ctx, next) => {
  const isBlacklisted = await cache.getCache(`blacklist:${ctx.token}`)
  if (isBlacklisted) {
    ctx.status = 401;
    ctx.action = 'LOGIN_FAILED';
    ctx.reason_of_failure = "Token is invalid";

    ctx.body = responseFormat({}, 'HEADER_REQUIRED_ACCESS_TOKEN', ctx.language);
    return;
  }
  await cache.getClient().setEx(`blacklist:${ctx.token}`, (cookieTiming.resetTime.minute + 1) * cookieTiming.resetTime.multiplierSecond, 'blacklisted')
  ctx.cookies.set("x-access-token", null, {
    httpOnly: true,
    secure: process.env.NODE_ENV != 'localhost',
    sameSite: process.env.NODE_ENV === 'localhost' ? "Lax" : "None",
    expires: new Date(0),
    maxAge: 0,
  });
  ctx.token = null;
  return next();
};

const preLoginService = () => async (ctx, next) => {
  try {
    const ips = ctx.ip;
    const AdminId = ctx.admin_id
    if (!AdminId) {
      ctx.status = 401;
      ctx.action = 'LOGIN_FAILED';
      ctx.body = responseFormat({}, 'GET_DATA_NOT_FOUND', ctx.language);
      return;
    }
    const jwtTemp = await jwtEncodeTemp(AdminId, ips, 'NORMAL');
    ctx.jwtTemp = jwtTemp;
    await next();
  } catch (error) {
    throw throwError(error, 'preLoginService');
  }
};

const isEmailVerify = () => async (ctx, next) => {
  const userinfo = ctx.user;
  if (Array.isArray(userinfo)) {
    const transformedData = userinfo.map((user) => ({
      adminID: user.admin_id,
      email: user.email,
      isVerified: user.email_verification === 1,
    }));
    if (transformedData[0].isVerified === false) {
      ctx.status = 401;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Email is Not Verified";
      ctx.body = responseFormat({}, 'UNVERIFIED_EMAIL', ctx.language)
      return;
    }
    ctx.state.transformedData = transformedData;
    ctx.isVerified = transformedData[0].isVerified;
    ctx.email = transformedData[0].email;

  }
  await next();
};

const currentUserInfo = () => async (ctx, next) => {
  const columnMap = {
    STATUS: `status`
  };
  const queries = await Promise.all(
    Object.entries(columnMap).map(async ([key, value]) => ({
      [key]: await getQueryDynamiCMD(key, value),
    }))
  );
  const queryStatus = queries.find((q) => q.STATUS)?.STATUS;
  const adminInfo = await knex(ADMINS)
    .select(
      "admin_id",
      "email",
      "first_name",
      "last_name",
      knex.raw(queryStatus)
    )
    .where({ admin_id: ctx.admin_id }).first();
  const constructData = {
    AdminId: adminInfo.admin_id,
    Email: adminInfo.email,
    FirstName: adminInfo.first_name,
    LastName: adminInfo.last_name,
  };
  ctx.result = constructData;
  return next();
}

const changeUserInfo = () => async (ctx, next) => {
  const columnMap = {
    STATUS: `status`
  };
  const { FirstName, LastName } = ctx.request.body;
  const adminId = ctx.admin_id;

  const queries = await Promise.all(
    Object.entries(columnMap).map(async ([key, value]) => ({
      [key]: await getQueryDynamiCMD(key, value),
    }))
  );
  const queryStatus = queries.find((q) => q.STATUS)?.STATUS;

  await knex(ADMINS)
    .where({ admin_id: adminId })
    .update({
      first_name: FirstName,
      last_name: LastName,
      // status: knex.raw(admins[0]['schema']['status']['updatestring'], [status, status]),
      status: 102
    });

  const trackingUserInfoOld = await knex(ADMIN_DATA_TRACKING)
    .select(
      'type_of_data',
      'admin_data_tracking_id',
      knex.raw(queryStatus)

    )
    .where({ admin_id: adminId, type_of_data: 2 })
    .orderBy('created_at', 'desc')
    .first()

  await knex(ADMIN_DATA_TRACKING)
    .update({
      type_of_data: 1,
      status: 402
    })
    .where({ admin_id: adminId, status: 102, type_of_data: 2 })

  const trackingUserInfoNew = await knex(ADMIN_DATA_TRACKING)
    .insert({
      admin_id: adminId,
      first_name: FirstName,
      last_name: LastName,
      type_of_data: 2,
      status: 102
    })



  ctx.old_data_id = trackingUserInfoOld.admin_data_tracking_id
  ctx.new_data_id = trackingUserInfoNew[0]

  return next();
}

const tokenAuthentication = () =>
  async (ctx, next) => {
    try {
      const token = ctx.cookies.get("x-access-token");
      const platform = ctx.platform;
      if (!ctx.language) {
        ctx.body = responseFormat({ param: 'header', error: 'accept-language' }, 'MISSING_REQUIRED_VALUES', 'EN');
        return;
      }
      if (!token) {
        ctx.status = 401;
        ctx.action = 'LOGOUT_FAILED';
        ctx.reason_of_failure = "Token is invalid";
        ctx.body = responseFormat({ error: 'x-access-token' }, 'HEADER_REQUIRED_ACCESS_TOKEN', ctx.language);
        return;
      }
      const decode = decodeJWTDynamic(token, jwt['hash']);
      if (!decode) {
        ctx.status = 401;
        ctx.action = 'LOGOUT_FAILED';
        ctx.reason_of_failure = "Token is invalid";
        ctx.body = responseFormat({ error: 'x-access-token' }, 'HEADER_REQUIRED_ACCESS_TOKEN', ctx.language);
        return;
      }
      if (decode?.token_type !== platform) {
        ctx.body = responseFormat({ error: 'x-access-token' }, 'HEADER_REQUIRED_ACCESS_TOKEN', ctx.language);
        return;
      }
      
      const data = await knex(ADMINS)
        .select('*')
        .where(`${ADMINS}.refresh_token`, decode['key'])
        .andWhere(`${ADMINS}.status`, 102);
      const AllowValue = []
      if (data[0] === undefined) {
        ctx.action = 'LOGOUT_FAILED';
        ctx.body = responseFormat({}, 'ACCESS_TOKEN_IS_NOT_TRUE', ctx.language);
        return;
      }
      data.forEach(({ admin_id, email, status, affiliation_id, merchant_id, branch_id, primary, level }) => { if (status === 102) AllowValue.push({ admin_id, email, status, affiliation_id, merchant_id, branch_id, primary, level }); });
      if (!AllowValue[0].admin_id) {
        ctx.action = 'LOGOUT_FAILED';
        ctx.body = responseFormat({}, 'ACCESS_TOKEN_IS_NOT_TRUE', ctx.language);
        return;
      }
      ctx.refreshToken = decode['key']
      ctx.AllDataDecodeToken = decode;
      ctx.token = token;
      ctx.result = AllowValue;
      ctx.email = AllowValue[0].email;

      ctx.admin_id = AllowValue[0].admin_id;
      ctx.result.level = AllowValue[0].level;
      ctx.user = AllowValue;
      return next();
    } catch (error) {
      throw throwError(error, 'tokenAuthentication');
    }
  }

const changePassword = () => async (ctx, next) => {
  try {
    const currentTime = DateTime.utc();
    const adminId = ctx.admin_id;
    const { OldPassword, NewPassword } = ctx.request.body || {};
    if (!adminId) {
      ctx.body = responseFormat({}, "PLEASE_LOG_IN_AGAIN", ctx.language);
      return;
    }
    if (!OldPassword || !NewPassword) {
      ctx.body = responseFormat({}, "MISSING_REQUIRED_FIELDS", ctx.language);
      return;
    }
    const admin = await knex(ADMINS).where({ admin_id: adminId }).first();
    const { password_hash } = admin;
    const isOldPasswordCorrect = await Argon2verifyPassword(OldPassword, admin.password_hash);
    if (!isOldPasswordCorrect) {
      ctx.body = responseFormat({}, "DATA_IS_NOT_EXISTS", ctx.language);
      return;
    }
    const isSameAsOldPassword = await Argon2verifyPassword(NewPassword, password_hash);
    if (isSameAsOldPassword) {
      ctx.body = responseFormat({}, "NEW_PASSWORD_SAME_AS_OLD", ctx.language);
      return;
    }
    const newHashedPassword = await Argon2hashPassword(NewPassword);
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    await knex(ADMINS)
      .where({ admin_id: adminId })
      .update({
        password_hash: newHashedPassword,
        refresh_token: newRefreshToken, // Optional
        updated_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      });

    ctx.result = NewPassword;

    return next();
  } catch (error) {
    throw throwError(error, "changePassword");
  }
};

const requestPasswordReset = () => async (ctx, next) => {
  try {
    const { Email } = ctx.request.body;
    // Validate email
    if (!Email) {
      ctx.body = responseFormat({}, 'PLEASE_PROVIDE_YOUR_EMAIL', ctx.language);
      return;
    }
    // Check if the admin exists
    const admin = await knex(ADMINS).where({ email: Email }).first();
    if (!admin) {
      ctx.body = responseFormat({}, 'SEND_LINK_IF_EMAIL_EXIST', ctx.language);
      return;
    }

    const currentTime = DateTime.utc();
    const adminId = admin.admin_id;
    const adminEmail = admin.email;
    const adminName = admin.first_name;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = DateTime.utc().plus({ hours: 1 }).toFormat('yyyy-MM-dd HH:mm:ss');
    
    await knex(REQUEST_SENDING_EMAIL).update({
      status: 402
    })
      .where({
        admin_id: adminId, topic_of_request: 2
      })
    // Save token and expiry in the database
    await knex(REQUEST_SENDING_EMAIL).insert({
      admin_id: adminId,
      topic_of_request: 2,
      email: Email,
      reset_token: resetTokenHash,
      reset_token_expiry_at: resetTokenExpiry,
      created_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      updated_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      status: 102,
    });

    // Prepare reset link
    const FrontendURL = config.get('ResetPasswordURL.host');
    const resetLink = `${FrontendURL}?email=${adminEmail}&token=${resetToken}`;


    const emailBody = generateResetEmailHTML(adminName, resetLink, "#675dd8");

    // Set email data in `ctx` for the next middleware
    ctx.admin_id = adminId;
    ctx.sendingEmail = {
      to: Email,
      subject: 'Password Reset Request',
      body: emailBody,
    };

    await next(); // Proceed to the sendEmail middleware
  } catch (error) {
    throw throwError(error, 'requestPasswordReset');
  }
};

const resetPasswordFromEmail = () => async (ctx, next) => {
  try {
    const NewPassword = ctx.NewPassword;
    const Token = ctx.resetTokenHash;
    const adminId = ctx.admin_id;
    const Email = ctx.email;
    const oldPassword = ctx.oldPassword;
    const resetToken = await knex(REQUEST_SENDING_EMAIL).where({
      admin_id: adminId,
      reset_token: Token,
      status: 102
    }).first();
    if (!resetToken) {
      ctx.body = responseFormat({}, 'INVALID_RESET_TOKEN', ctx.language);
      return;
    }
    const currentTime = DateTime.utc();
    const resetTokenExpiry = DateTime.fromJSDate(resetToken.reset_token_expiry_at).toUTC();
    if (currentTime > resetTokenExpiry) {
      ctx.body = responseFormat({}, 'RESET_TOKEN_EXPIRED', ctx.language);
      return;
    }

    const isSameAsOldPassword = await Argon2verifyPassword(NewPassword, oldPassword);

    if (isSameAsOldPassword) {
      ctx.body = responseFormat({}, "NEW_PASSWORD_SAME_AS_OLD", ctx.language);
      return;
    }

    const newHashedPassword = await Argon2hashPassword(NewPassword);
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    await knex(ADMINS)
      .where({ admin_id: adminId })
      .update({
        password_hash: newHashedPassword,
        refresh_token: newRefreshToken, // Optional
        updated_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      });

    // Delete the reset token from the database
    await knex(REQUEST_SENDING_EMAIL).where({
      admin_id: adminId,
      email: Email,
      topic_of_request: 2,
    }).del();

    ctx.admin_id = adminId;
    ctx.result = NewPassword;

    return next();
  } catch (error) {
    throw throwError(error, 'resetPasswordFromEmail');
  }
};

const requestVerifyEmail = () => async (ctx, next) => {
  try {
    const { Email } = ctx.request.body;

    const emailVerified = await knex(ADMINS)
      .select('admin_id')
      .where({ email: Email, email_verification: 1 })
      .first();

    if (emailVerified) {
      ctx.body = responseFormat({}, 'EMAIL_IS_VERIFIED', ctx.language);
      return;
    }
    const admin = await knex(ADMINS).where({ email: Email }).first();
    if (!admin) {
      ctx.body = responseFormat({}, 'SEND_LINK_IF_EMAIL_EXIST', ctx.language);
      return;
    }
    const currentTime = DateTime.utc();

    const adminId = admin.admin_id;
    const adminName = admin.first_name;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = DateTime.utc().plus({ hours: 1 }).toFormat('yyyy-MM-dd HH:mm:ss');

    await knex(REQUEST_SENDING_EMAIL).where({
      admin_id: adminId, topic_of_request: 1
    })
      .update({
        status: 402
      })


    await knex(REQUEST_SENDING_EMAIL).insert({
      admin_id: adminId,
      topic_of_request: 1,
      email: Email,
      reset_token: resetTokenHash,
      reset_token_expiry_at: resetTokenExpiry,
      created_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      updated_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      status: 102,
    });
    const FrontendURL = config.get('VerifyEmailURL.host');
    const resetLink = `${FrontendURL}?tokenVerifyEmail=${resetToken}`;
    const emailBody = generateEmailConfirmationHTML(adminName, resetLink, "#675dd8");

    ctx.admin_id = adminId;
    ctx.sendingEmail = {
      to: Email,
      subject: 'Verify Email Request',
      body: emailBody,
    };
    await next();
  } catch (error) {
    throw throwError(error, 'requestVerifyEmail');
  }
}

const verifyEmail = () => async (ctx, next) => {
  try {
    const adminId = ctx.admin_id;
    const tokenVerifyEmail = ctx.resetTokenHash;
    const Email = ctx.email;
    const resetToken = await knex(REQUEST_SENDING_EMAIL).where({
      admin_id: adminId,
      email: Email,
      reset_token: tokenVerifyEmail,
      status: 102
    }).first();
    if (!resetToken) {
      ctx.body = responseFormat({}, 'INVALID_RESET_TOKEN', ctx.language);
      return;
    }
    const currentTime = DateTime.utc();
    const resetTokenExpiry = DateTime.fromJSDate(resetToken.reset_token_expiry_at).toUTC();
    if (currentTime > resetTokenExpiry) {
      ctx.body = responseFormat({}, 'EMAIL_VERIFY_LINK_EXPIRED', ctx.language);
      return;
    }
    await knex(ADMINS)
      .where({ admin_id: adminId, email: Email })
      .update({
        email_verification: 1,
        is_2fa_active: 1,
        updated_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      });
    await knex(REQUEST_SENDING_EMAIL).where({
      admin_id: adminId,
      email: Email,
      topic_of_request: 1,
    }).del();
    ctx.admin_id = adminId;
    return next();
  } catch (error) {
    throw throwError(error, 'verifyEmail');
  }
}


module.exports = {
  basicAuthentication,
  tokenAuthentication,
  currentUserInfo,
  changeUserInfo,
  preLoginService,
  loginService,
  changePassword,
  requestPasswordReset,
  resetPasswordFromEmail,
  requestVerifyEmail,
  isEmailVerify,
  verifyEmail,
  logoutService
}
