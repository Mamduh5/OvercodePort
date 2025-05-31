const crypto = require('crypto');
const { throwError } = require('../libs/errorService.js')
const {  Argon2hashPassword } = require('../libs/password.js')
const {
  ADMINS,
  MERCHANTS,
  BRANCH,
  ADMIN_DATA_TRACKING
} = require('../enum/index.js')
const { knex } = require('../libs/knex.js');

const getAllListAdmins = () => async (ctx, next) => {
  try {
    let data = await knex(ADMINS)
      .select(
        'admins.admin_id',
        'admins.first_name',
        'admins.last_name',
        'admins.email',
        'admins.status',
        'admins.created_at',
        'admins.updated_at',
        'admins.email_verification',
        'admins.is_2fa_active'
      )

    
    ctx.result = data ;
    return next();
  } catch (error) {
    throw throwError(error, 'getAllListAdmins');
  }
};

const insertAdmins = () => async (ctx, next) => {
  try {
    const { Password, Email:email , FirstName:first_name,LastName:last_name } = ctx.request.body || {}
    let AllData = { email,first_name,last_name}
    let newRefreshToken = crypto.randomBytes(64).toString('hex');
    const Argon2HashPassword = await Argon2hashPassword(Password)
    const insertAdmin = await knex(ADMINS).insert({
      ...AllData,
      password_hash: Argon2HashPassword,
      refresh_token: newRefreshToken,
      // created_at: moment.utc().toISOString(),
      email_verification:0,
      is_2fa_active:0,
      status: 102
    });

    const adminId = insertAdmin[0]
    const FirstName = AllData.first_name
    const LastName = AllData.last_name
    const trackingUserInfoNew = await knex(ADMIN_DATA_TRACKING)
    .insert({
      admin_id: adminId,
      first_name: FirstName,
      last_name: LastName,
      type_of_data: 2,
      status: 102
    })

    ctx.new_data_id = trackingUserInfoNew[0]
    ctx.target_admin_id = adminId
    
    return next()
  } catch (error) {
    throw throwError(error, 'insertAdmins')
  }
}

module.exports = { getAllListAdmins, insertAdmins }