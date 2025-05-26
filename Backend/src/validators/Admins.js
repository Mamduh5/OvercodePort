const { knex } = require('../libs/knex.js');
const ValidateSchema = require('./schemas/admins/InsertAdminsValidateSchema.js'); // Import Joi Schema
const { responseFormat } = require('../libs/formatResponse.js')
const { throwError } = require('../libs/errorService.js')
const { passwordPolicyValidate } = require('../callservices/passwordPolicy.js')
const {
  ADMINS,
  REQUEST_SENDING_EMAIL
} = require('../enum/index.js')
const PasswordSchema = require('../validators/schemas/admins/ChangeAdminsPasswordValidate.js')
const RequestResetPasswordSchema = require("../validators/schemas/admins/RequestResetPasswordAdminsValidateSchema.js")
const ResetPasswordFromEmailValidateSchema = require("../validators/schemas/admins/ResetPasswordFromEmailValidateSchema.js")
const VerifyEmailThroughEmailValidateSchema = require("../validators/schemas/admins/VerifyEmailValidateSchema.js")
const { Argon2verifyPassword } = require('../libs/password.js')

const crypto = require('crypto');


const InsertAdminsValidate = () => async (ctx, next) => {
  try {
    const { error, value } = ValidateSchema.InsertAdminsValidateSchema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => (
        {
          field: err.path.join('.'),
          value: err.context?.value || '',
          message: err.message,
        }));
      const formattedResponse = responseFormat({ [errors[0].field]: errors[0].value }, errors[0].message, ctx.language);
      ctx.body = formattedResponse;
      return;
    } else if (!value) {
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language)
      return;
    }


    
    const { Email, Password } = value || {};
    let status = await passwordPolicyValidate(Password,Email)
    if (status === false) {
      ctx.body = responseFormat({}, 'DONT_FOUND_PASSWORD_POLICY', ctx.language);
      return
    }
    let { status: statusPassword, errors: errorPassword } = status
    if (statusPassword === false) {
      ctx.body = responseFormat(errorPassword[0]['validate'], errorPassword[0]['code'], ctx.language);
      return;
    }
    const findUser = await knex(ADMINS).select('admin_id').where({ Email }).first();
    if (findUser) {
      ctx.body = responseFormat({}, 'ALREADY_EMAIL', ctx.language);
      return;
    }
    await next();
  } catch (error) { throw throwError(error, 'InsertAdminsValidate') }
};

const ChangeAdminsValidate = () => async (ctx, next) => {
  try {
    const { error, value } = PasswordSchema.changeAdminsPasswordValidateSchema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => (
        {
          field: err.path.join('.'),
          value: err.context?.value || '',
          message: err.message,
        }));
      const formattedResponse = responseFormat({ [errors[0].field]: errors[0].value }, errors[0].message, ctx.language);
      ctx.body = formattedResponse;
      return;
    } else if (!value) {
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language)
      return;
    }
    const { NewPassword } = value || {};
    let status = await passwordPolicyValidate(NewPassword,ctx.email)
    if (status === false) {
      ctx.body = responseFormat({}, 'DONT_FOUND_PASSWORD_POLICY', ctx.language)
      return;
    }
    
    let { status: statusPassword, errors: errorPassword } = status
    if (statusPassword === false) {
      ctx.body = responseFormat(errorPassword[0]['validate'], errorPassword[0]['code'], ctx.language);
      return;
    }
    await next();
  } catch (error) { throw throwError(error, 'ChangeAdminsValidate') }
};

const RequestResetAdminsValidate = () => async (ctx, next) => {
  try {
    const { error, value } = RequestResetPasswordSchema.requestResetAdminsPasswordValidateSchema.validate(ctx.request.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((err) => ({
        field: err.path.join('.'),
        value: err.context?.value || '',
        message: err.message,
      }));
      const response = responseFormat({ [errors[0].field]: errors[0].value }, errors[0].message, ctx.language);
      ctx.body = response;
      return;
    } else if (!value) {
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language);
      return;
    }
    const { Email } = value || {};
    const findAdmins = await knex(ADMINS).select('admin_id').where({ email: Email }).first();
    if (!findAdmins) {
      ctx.body = responseFormat({}, 'GET_DATA_NOT_FOUND', ctx.language)
      return;
    }
    ctx.validatedData = value;
    return next();
  } catch (error) {
    throw throwError(error, 'RequestResetAdminsValidate');
  }
};

const ResetAdminsPasswordFromEmailValidate = () => async (ctx, next) => {
  try {

    const { error, value } = ResetPasswordFromEmailValidateSchema.ResetPasswordFromEmailValidateSchema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => (
        {
          field: err.path.join('.'),
          value: err.context?.value || '',
          message: err.message,
        }));
      const formattedResponse = responseFormat({ [errors[0].field]: errors[0].value }, errors[0].message, ctx.language);
      ctx.body = formattedResponse;
      return;
    } else if (!value) {
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language)
      return;
    }
    const { NewPassword, Token } = value || {};
    const resetTokenHash = crypto.createHash('sha256').update(Token).digest('hex');
    

    const findAdmins = await knex(REQUEST_SENDING_EMAIL)
    .select(
      'request_sending_email.admin_id',
      'request_sending_email.email', 
      'admins.password_hash'
    )
    .leftJoin('admins', 'request_sending_email.admin_id', 'admins.admin_id')
    .where({ 'request_sending_email.reset_token': resetTokenHash })
    .first();

    if (!findAdmins) {
      ctx.body = responseFormat({}, 'INVALID_RESET_TOKEN', ctx.language)
      return;
    }
    const oldPassword = findAdmins.password_hash
    let status = await passwordPolicyValidate(NewPassword,findAdmins.email)
    if (status === false) {
      ctx.body = responseFormat({}, 'DONT_FOUND_PASSWORD_POLICY', ctx.language)
      return;
    }
    let { status: statusPassword, errors: errorPassword } = status
    if (statusPassword === false) {
      ctx.body = responseFormat(errorPassword[0]['validate'], errorPassword[0]['code'], ctx.language);
      return;
    }
   
    ctx.oldPassword = oldPassword;
    ctx.NewPassword = NewPassword;
    ctx.admin_id = findAdmins.admin_id;
    ctx.email = findAdmins.email;
    ctx.resetTokenHash = resetTokenHash;

    await next();
  } catch (error) { throw throwError(error, 'ChangeAdminsValidate') }
}

const VerifyEmailThroughEmailValidate = () => async (ctx, next) => {
  try {

    const { error, value } = VerifyEmailThroughEmailValidateSchema.VerifyEmailValidateSchema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => (
        {
          field: err.path.join('.'),
          value: err.context?.value || '',
          message: err.message,
        }));
      const formattedResponse = responseFormat({ [errors[0].field]: errors[0].value }, errors[0].message, ctx.language);
      ctx.body = formattedResponse;
      return;
    } else if (!value) {
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language)
      return;
    }
    const { tokenVerifyEmail } = value || {};
    const resetTokenHash = crypto.createHash('sha256').update(tokenVerifyEmail).digest('hex');
    

    const findAdmins = await knex(REQUEST_SENDING_EMAIL)
    .select(
      'admin_id',
      'email', 
    )
    .where({ 'reset_token': resetTokenHash })
    .first();

    if (!findAdmins) {
      ctx.body = responseFormat({}, 'GET_DATA_NOT_FOUND', ctx.language)
      return;
    }
   
    ctx.admin_id = findAdmins.admin_id;
    ctx.email = findAdmins.email;
    ctx.resetTokenHash = resetTokenHash;

    await next();
  } catch (error) { throw throwError(error, 'ChangeAdminsValidate') }
}
module.exports = { InsertAdminsValidate, ChangeAdminsValidate, RequestResetAdminsValidate, ResetAdminsPasswordFromEmailValidate, VerifyEmailThroughEmailValidate }