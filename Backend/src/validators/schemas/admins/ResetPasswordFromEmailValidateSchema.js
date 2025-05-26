const Joi = require('joi');
const config = require('config')

const ResetPasswordFromEmailValidateSchema = Joi.object({
  NewPassword: Joi.string()
    .min(12)
    .max(25)
    .required()
    .pattern(/^\S.*/)
    .messages({
      'string.email': 'INVALID_EMAIL_FORMAT', // เมื่อ field เป็นค่าว่าง
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.min': 'CHARACTER_MINIMUM_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.pattern.base': 'NO_LEADING_SPACES',
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
  Token: Joi.string()
    .max(64)
    .required()
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
  TokenRecaptcha: Joi.string()
    .required()
    .pattern(/^\S.*/)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.pattern.base': 'NO_LEADING_SPACES',
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
}).strict() // ป้องกันค่าอื่นที่ไม่ได้อยู่ใน schema
  .unknown(false) // ไม่อนุญาตให้ส่งฟิลด์ที่ไม่ได้กำหนดใน schema
  .messages({
    'object.unknown': 'HAS_PROBLEM_API', // ข้อความ error สำหรับฟิลด์ที่ไม่รู้จัก
  });

module.exports = { ResetPasswordFromEmailValidateSchema };