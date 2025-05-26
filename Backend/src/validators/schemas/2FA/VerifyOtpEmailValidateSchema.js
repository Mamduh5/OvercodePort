const Joi = require('joi');

const VerifyOtpEmailAValidateSchema = Joi.object({
  otp: Joi.alternatives()
    .try(
      Joi.number().integer(), // Accept numbers
      Joi.string().trim().pattern(/^\d+$/).custom((value) => parseInt(value, 10)) // Convert string to integer
    )
    .required()
    .messages({
      'number.base': 'MUST_BE_INTEGER',          // When the value is not an integer
      'string.empty': 'CHARACTER_MINIMUM_LENGTH', // When the field is empty
      'string.pattern.base': 'MUST_BE_INTEGER',  // When a string contains non-numeric characters
      'any.required': 'MISSING_REQUIRED_VALUES', // When the field is missing (required)
    }),
  RefCode: Joi.string()
    .max(50)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
})
  .strict()         // Prevents extra fields not in schema
  .unknown(false)   // Disallows unknown fields
  .messages({
    'object.unknown': 'HAS_PROBLEM_API', // Custom error for unknown fields
  });

module.exports = { VerifyOtpEmailAValidateSchema };
