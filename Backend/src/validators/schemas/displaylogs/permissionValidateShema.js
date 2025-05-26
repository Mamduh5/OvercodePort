const Joi = require('joi');

const permissionSchema = Joi.object({
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
      'number.base': 'MUST_BE_INTEGER',
      'number.empty': 'MISSING_REQUIRED_VALUES',
      'any.required': 'MISSING_REQUIRED_VALUES',
    }),
      RoleModelId: Joi.alternatives()
            .try(
                Joi.number()
                    .integer()
                    .positive()
                    .required()
                    .messages({
                        'string.empty': 'MISSING_REQUIRED_VALUES',
                        "number.base": "REQUIRED_ONLY_POSITIVE_INTEGER",
                        "number.positive": "REQUIRED_ONLY_POSITIVE_INTEGER",
                        "number.integer": "ONLY_INTEGER_ALLOWED",
                        "any.required": "MISSING_REQUIRED_VALUES",
                    }),
                Joi.string()
                    .pattern(/^\d+$/)
                    .required()
                    .messages({
                        'string.empty': 'MISSING_REQUIRED_VALUES',
                        "string.pattern.base": "ONLY_NUMERIC_STRING_INTEGER_ALLOWED",
                        "any.required": "MISSING_REQUIRED_VALUES",
                    })
            )
            .required()
            .messages({
                'string.empty': 'MISSING_REQUIRED_VALUES',
                "any.required": "MISSING_REQUIRED_VALUES",
            }),
}).prefs({
  convert: true,
  errors: { wrap: { label: false } },
}).strict()
  .unknown(false)
  .messages({
    'object.unknown': 'HAS_PROBLEM_API',

  });

module.exports = { permissionSchema };
