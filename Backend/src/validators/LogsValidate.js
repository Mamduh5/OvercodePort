const { responseFormat } = require('../libs/formatResponse.js')
const { throwError } = require('../libs/errorService.js')
const { knex } = require('../libs/knex.js');
const { AUTH_ADMIN_CHANGE_LOGS } = require('../enum/index.js');
const adminMovementSchema = require('./schemas/displaylogs/adminMovementValidate.js');
const LoginLogShema = require('./schemas/displaylogs/loginLogsValidateShema.js')
const PermissionShema = require('./schemas/displaylogs/permissionValidateShema.js')
const preprocessValue = (key, value) => {
  // Keys that should be numeric
  if (key === "PageSize" || key === "Page") {
    return {
      type: "number",
      value: value !== undefined && value !== null && !isNaN(value) ? Number(value) : null,
    };
  }

  // Keys that should be strings
  if (typeof value === "string") {
    return {
      type: "string",
      value: value.trim() || null,
    };
  }

  // Default case for unsupported keys
  return {
    type: "unknown",
    value: null,
  };
};

const LogLoginValidate = () => async (ctx, next) => {
  try {
    const preprocessedQuery = Object.fromEntries(
      Object.entries(ctx.query).map(([key, value]) => [key, preprocessValue(key, value)])
    );

    const rawQuery = Object.fromEntries(
      Object.entries(preprocessedQuery).map(([key, { value }]) => [key, value])
    );

    const { error, value } = LoginLogShema.loginLogSchema.validate(rawQuery, {
      abortEarly: false,
    });

    if (error) {
      console.error("Validation Errors:", error.details);

      const errors = error.details.map((err) => ({
        field: err.path.join("."),
        value: ctx.query[err.path.join(".")],
        message: err.message,
      }));

      ctx.body = {
        res_code: "4000",
        res_type: "error",
        res_message: "Validation errors occurred",
        res_data: errors.reduce((acc, err) => {
          acc[err.field] = { value: err.value, message: err.message };
          return acc;
        }, {}),
        res_time: Math.floor(Date.now() / 1000),
      };
      return;
    }
    
    ctx.validatedData = value;
    return next();
  } catch (error) {
    throw new Error(`ListMerchantValidate Error: ${error.message}`);
  }
};

const adminChangeValidate = () => async (ctx, next) => {
  try {
    const preprocessedQuery = Object.fromEntries(
      Object.entries(ctx.query).map(([key, value]) => [key, preprocessValue(key, value)])
    );

    const rawQuery = Object.fromEntries(
      Object.entries(preprocessedQuery).map(([key, { value }]) => [key, value])
    );

    const { error, value } = adminMovementSchema.adminMovementSchema.validate(rawQuery, {
      abortEarly: false,
    });

    if (error) {
      console.error("Validation Errors:", error.details);

      const errors = error.details.map((err) => ({
        field: err.path.join("."),
        value: ctx.query[err.path.join(".")],
        message: err.message,
      }));

      ctx.body = {
        res_code: "4000",
        res_type: "error",
        res_message: "Validation errors occurred",
        res_data: errors.reduce((acc, err) => {
          acc[err.field] = { value: err.value, message: err.message };
          return acc;
        }, {}),
        res_time: Math.floor(Date.now() / 1000),
      };
      return;
    }

    ctx.validatedData = value;
    return next();
  } catch (error) {
    throw new Error(`ListMerchantValidate Error: ${error.message}`);
  }
};

const PermissionValidate = () => async (ctx, next) => {
  try {

    const preprocessedQuery = Object.fromEntries(
      Object.entries(ctx.query).map(([key, value]) => [key, preprocessValue(key, value)])
    );

    const rawQuery = Object.fromEntries(
      Object.entries(preprocessedQuery).map(([key, { value }]) => [key, value])
    );

    const { error, value } = PermissionShema.permissionSchema.validate(rawQuery, {
      abortEarly: false,
    });

    if (error) {
      console.error("Validation Errors:", error.details);

      const errors = error.details.map((err) => ({
        field: err.path.join("."),
        value: ctx.query[err.path.join(".")],
        message: err.message,
      }));

      ctx.body = {
        res_code: "4000",
        res_type: "error",
        res_message: "Validation errors occurred",
        res_data: errors.reduce((acc, err) => {
          acc[err.field] = { value: err.value, message: err.message };
          return acc;
        }, {}),
        res_time: Math.floor(Date.now() / 1000),
      };
      return;
    }

    ctx.validatedData = value;
    return next();
  } catch (error) {
    throw new Error(`ListMerchantValidate Error: ${error.message}`);
  }
};
module.exports = {
  LogLoginValidate,
  adminChangeValidate,
  PermissionValidate

}