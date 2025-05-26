const Joi = require('joi');
const config = require('config')

const changeAdminsPasswordValidateSchema = Joi.object({
    OldPassword: Joi.string()
    .min(12)
    .max(25)
    .required()
    .pattern(/^\S.*/)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.min': 'CHARACTER_MINIMUM_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.pattern.base': 'NO_LEADING_SPACES',
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
    NewPassword: Joi.string()
    .min(12)
    .max(25)
    .required()
    .pattern(/^\S.*/)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.min': 'CHARACTER_MINIMUM_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'string.pattern.base': 'NO_LEADING_SPACES',
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
}).strict() // ป้องกันค่าอื่นที่ไม่ได้อยู่ใน schema
  .unknown(false) // ไม่อนุญาตให้ส่งฟิลด์ที่ไม่ได้กำหนดใน schema
  .messages({
    'object.unknown': 'HAS_PROBLEM_API', // ข้อความ error สำหรับฟิลด์ที่ไม่รู้จัก
  });
 

module.exports = { changeAdminsPasswordValidateSchema };