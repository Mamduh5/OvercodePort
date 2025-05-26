const Joi = require('joi');
const config = require('config')

const InsertAdminsValidateSchema = Joi.object({
  Email: Joi.string()
    .email()
    .max(50)
    .required()
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.email': 'INVALID_EMAIL_FORMAT',    // เมื่อ email format ไม่ถูกต้อง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
  Password: Joi.string()
    // .max()
    .required()
    .pattern(/^\S.*/)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      // 'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.pattern.base': 'NO_LEADING_SPACES',
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
  FirstName: Joi.string()
    .max(99)
    .pattern(/^\S.*/)
    .messages({
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.pattern.base': 'NO_LEADING_SPACES',
    }),
  LastName: Joi.string()
    .max(99)
    .pattern(/^\S.*/)
    .messages({
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.pattern.base': 'NO_LEADING_SPACES',
    }),
}).strict() // ป้องกันค่าอื่นที่ไม่ได้อยู่ใน schema
  .unknown(false) // ไม่อนุญาตให้ส่งฟิลด์ที่ไม่ได้กำหนดใน schema
  .messages({
    'object.unknown': 'HAS_PROBLEM_API', // ข้อความ error สำหรับฟิลด์ที่ไม่รู้จัก

  });

module.exports = { InsertAdminsValidateSchema };