const Joi = require('joi');
const config = require('config')

const updateUserInfoValidateSchema = Joi.object({
  FirstName: Joi.string()
    .max(50)
    .required()
    .pattern(/^\S.*/)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.pattern.base': 'NO_LEADING_SPACES',
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
    LastName: Joi.string()
    .max(50)
    .required()
    .pattern(/^\S.*/)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.pattern.base': 'NO_LEADING_SPACES',
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
    RoleModelId: Joi.number()
    .integer()
    .messages({
      'number.base': 'MUST_BE_INTEGER',         // When the value is not an integer
      'number.empty': 'MISSING_REQUIRED_VALUES', // When the field is empty
      'any.required': 'MISSING_REQUIRED_VALUES', // When the field is missing (required)
    }),
}).strict() // ป้องกันค่าอื่นที่ไม่ได้อยู่ใน schema
  .unknown(false) // ไม่อนุญาตให้ส่งฟิลด์ที่ไม่ได้กำหนดใน schema
  .messages({
    'object.unknown': 'HAS_PROBLEM_API', // ข้อความ error สำหรับฟิลด์ที่ไม่รู้จัก
  });

module.exports = { updateUserInfoValidateSchema };