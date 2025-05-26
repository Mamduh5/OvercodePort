const Joi = require('joi');

const VerifyEmailValidateSchema = Joi.object({
    tokenVerifyEmail: Joi.string()
        .max(64)
        .required()
        .messages({
            'string.empty': 'MISSING_REQUIRED_VALUES', // เมื่อ field เป็นค่าว่าง
            'string.max': 'CHARACTER_OVER_LENGTH',     // เมื่อเกินความยาวที่กำหนด
            'any.required': 'MISSING_REQUIRED_VALUES', // เมื่อ field ไม่มีค่า (required)
        }),
}).strict() // ป้องกันค่าอื่นที่ไม่ได้อยู่ใน schema
    .unknown(false) // ไม่อนุญาตให้ส่งฟิลด์ที่ไม่ได้กำหนดใน schema
    .messages({
        'object.unknown': 'HAS_PROBLEM_API', // ข้อความ error สำหรับฟิลด์ที่ไม่รู้จัก
    });

module.exports = { VerifyEmailValidateSchema };