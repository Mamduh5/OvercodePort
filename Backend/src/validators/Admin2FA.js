const { knex } = require('../libs/knex.js');
const { responseFormat } = require('../libs/formatResponse.js')
const { throwError } = require('../libs/errorService.js')
const {
  ADMINS,
  REQUEST_SENDING_EMAIL,
  ADMIN_2FA_REQUEST
} = require('../enum/index.js')
const VerifyEnable2FAThroughEmailValidateSchema = require('../validators/schemas/2FA/VerifyEnable2FA.js')
const VerifyOtpEmailValidateSchema = require('../validators/schemas/2FA/VerifyOtpEmailValidateSchema.js')
const crypto = require('crypto');

const VerifyEnable2FAThroughEmailValidate = () => async (ctx, next) => {
  try {

    const { error, value } = VerifyEnable2FAThroughEmailValidateSchema.VerifyEnable2FAValidateSchema.validate(ctx.request.body, { abortEarly: false });
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
    const { Token } = value || {};
    const resetTokenHash = crypto.createHash('sha256').update(Token).digest('hex');
    

    const findAdmins = await knex(REQUEST_SENDING_EMAIL)
    .select(
      'admin_id',
      'email', 
    )
    .where({ 'reset_token': resetTokenHash, status: 102 })
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

const VerifyOtpEmailValidate = () => async (ctx, next) => {
  try {
    const { error } = VerifyOtpEmailValidateSchema.VerifyOtpEmailAValidateSchema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      const firstError = error.details[0];
      ctx.body = responseFormat(
        { [firstError.path.join('.')]: firstError.context?.value || '' },
        firstError.message,
        ctx.language
      );
      return;
    }


    await next();
  } catch (error) { throw throwError(error, 'ChangeAdminsValidate') }
};


module.exports = { VerifyEnable2FAThroughEmailValidate, VerifyOtpEmailValidate }