const Joi = require('joi');

const otpLogInSchema = Joi.object({
  otp: Joi.string() // ✅ Change to `string()` to prevent leading zeros from being removed
    .min(6)
    .max(6)
    .required()
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // When field is empty
      'string.max': 'CHARACTER_OVER_LENGTH',     // When value exceeds max length
      'string.min': 'CHARACTER_MINIMUM_LENGTH',    // When value is under min length
      'any.required': 'MISSING_REQUIRED_VALUES', // When field is missing (required)
    }),
    RefCode: Joi.string() // ✅ Change to `string()` to prevent leading zeros from being removed
    .max(8)
    .required()
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // When field is empty
      'string.max': 'CHARACTER_OVER_LENGTH',     // When value exceeds max length
      'any.required': 'MISSING_REQUIRED_VALUES', // When field is missing (required)
    }),
  TempToken: Joi.string() // ✅ Change `TempToken` to `tempToken` (consistent casing)
    .max(512)
    .required()
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // When field is empty
      'any.required': 'MISSING_REQUIRED_VALUES', // When field is missing (required)
    }),
})
  .strict() // Prevents additional unexpected fields
  .unknown(false) // Disallow unknown fields
  .messages({
    'object.unknown': 'HAS_PROBLEM_API', // Error message for unknown fields
  });


module.exports = { otpLogInSchema }; 