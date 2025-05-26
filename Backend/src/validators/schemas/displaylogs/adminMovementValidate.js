const Joi = require('joi');

const adminMovementSchema = Joi.object({
  SortColumn: Joi.string()
    .max(50)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
  SortOrder: Joi.string()
    .max(50)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
  SearchTerm: Joi.string()
    .max(50)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
  StartDate: Joi.string()
    .max(50)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
  EndDate: Joi.string()
    .max(50)
    .messages({
      'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
      'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
      'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
    }),
  Page: Joi.number()
    .integer()
    .messages({
      'number.base': 'MUST_BE_INTEGER',         // When the value is not an integer
      'number.empty': 'MISSING_REQUIRED_VALUES', // When the field is empty
      'any.required': 'MISSING_REQUIRED_VALUES', // When the field is missing (required)
    }),
  PageSize: Joi.number()
    .integer()
    .messages({
      'number.base': 'MUST_BE_INTEGER',         // When the value is not an integer
      'number.empty': 'MISSING_REQUIRED_VALUES', // When the field is empty
      'any.required': 'MISSING_REQUIRED_VALUES', // When the field is missing (required)
    })
}).prefs({
  convert: true, // Automatically convert types (e.g., string '123' -> number 123)
  errors: { wrap: { label: false } }, // Use `false` to disable wrapping
}).strict() // ป้องกันค่าอื่นที่ไม่ได้อยู่ใน schema
  .unknown(false) // ไม่อนุญาตให้ส่งฟิลด์ที่ไม่ได้กำหนดใน schema
  .messages({
    'object.unknown': 'HAS_PROBLEM_API', // ข้อความ error สำหรับฟิลด์ที่ไม่รู้จัก

  });

module.exports = { adminMovementSchema };
