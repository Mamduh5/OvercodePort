const { PASSWORD_POLICY } = require('../enum');
const { knex } = require('../libs/knex');

const getPasswordPolicyData = async () => {
    return await knex(PASSWORD_POLICY).select('*').where({ password_policy_id: 1, status: 102 }).first();
};

const validateLength = (password, policy, errors) => {
    if (policy.require_min_length === 1 && password.length < policy.min_length) {
        errors.push({ code: 'PASSWORD_MINIMUM_REQUEST', validate: { 'min_length': policy.min_length } });
    }
    if (policy.require_max_length === 1 && password.length > policy.max_length) {
        errors.push({ code: 'PASSWORD_MAXIMUM_REQUEST', validate: { 'max_length': policy.max_length } });
    }
};

const validateNumbers = (password, policy, errors) => {
    if (policy.require_numbers === 1) {
        const numberMatch = password.match(/\d/g) || [];
        if (numberMatch.length < policy.numbers_length) {
            errors.push({
                code: 'PASSWORD_NUMBER_LESS',
                validate: { required_numbers: policy.numbers_length, actual_numbers: numberMatch.length }
            });
        }
    }
};

const validateSpecialCharacters = (password, policy, errors) => {
    if (policy.require_special_characters === 1) {
        const escapedAllowed = policy.allowed_special_characters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const allowedPattern = new RegExp(`[${escapedAllowed}]`, 'g');

        // Match all allowed special characters in the password
        const allowedMatches = password.match(allowedPattern) || [];

        // Match all actual special characters in the password
        const allSpecialPattern = /[^a-zA-Z0-9]/g;
        const allSpecialMatches = password.match(allSpecialPattern) || [];

        // Find invalid special characters
        const invalidSpecials = allSpecialMatches.filter(char => !policy.allowed_special_characters.includes(char));

        // Check if not enough allowed special characters
        if (allowedMatches.length < policy.special_characters_length) {
            errors.push({
                code: 'PASSWORD_SPECIAL_LESS',
                validate: {
                    required_special_characters: policy.special_characters_length,
                    actual_special_characters: allowedMatches.length,
                    allowed_special_characters: policy.allowed_special_characters
                }
            });
        }

        // If any invalid special characters found
        if (invalidSpecials.length > 0) {
            errors.push({
                code: 'PASSWORD_SPECIAL_INVALID',
                validate: {
                    invalid_special_characters: invalidSpecials,
                    allowed_special_characters: policy.allowed_special_characters
                }
            });
        }
    }
};


const validateEnglishOnly = (password, policy, errors) => {
    if (policy.allow_english_only === 1) {
        if (policy.require_lowercase === 1) {
            const lowercaseMatch = password.match(/[a-z]/g) || [];
            if (lowercaseMatch.length < policy.lowercase_length) {
                errors.push({
                    code: 'PASSWORD_LOWERCASE_LESS',
                    validate: { required_lowercase: policy.lowercase_length, actual_lowercase: lowercaseMatch.length }
                });
            }
        }
        if (policy.require_uppercase === 1) {
            const uppercaseMatch = password.match(/[A-Z]/g) || [];
            if (uppercaseMatch.length < policy.uppercase_length) {
                errors.push({
                    code: 'PASSWORD_UPPERCASE_LESS',
                    validate: { required_uppercase: policy.uppercase_length, actual_uppercase: uppercaseMatch.length }
                });
            }
        }
        const englishOnlyPattern = new RegExp(`[^a-zA-Z0-9${policy.allowed_special_characters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
        if (englishOnlyPattern.test(password)) {
            errors.push({ code: 'PASSWORD_ENGLISH_LESS', validate: { allow_english_only: policy.allow_english_only } });
        }
    }
};

const validatePasswordSimilarityRule = (password, username, policy, errors) => {
    if (policy.require_password_similarity_rule === 1) {
        // ตรวจสอบว่า password มีตัวอักษรเหมือนกับ username ติดกัน 4 ตัวหรือไม่
        const minLength = policy.password_similarity_rule_length;
        let matchSubstring = ''; // ตัวอักษรที่ตรงกัน    
        let resetMatch = false; // รีเซ็ตการนับเมื่อพบการตรงกัน

        // แปลง username และ password เป็นพิมพ์เล็กเพื่อการตรวจสอบที่ไม่สนใจ case
        const lowerCaseUsername = username.toLowerCase();
        const lowerCasePassword = password.toLowerCase();

        for (let i = 0; i < lowerCaseUsername.length; i++) {
            const currentSubstring = lowerCaseUsername.slice(i, i + minLength); // หาตัวอักษรที่ตรงกัน
            if (lowerCasePassword.includes(currentSubstring)) {
                // ถ้าพบการตรงกัน
                if (!resetMatch) {
                    matchSubstring = currentSubstring; // เก็บตัวอักษรที่ตรงกัน
                    resetMatch = true;
                } else {
                    // ถ้ามีการตรงกันเกิน 1 ครั้ง
                    errors.push({
                        code: 'PASSWORD_SIMILARITY_RULE',
                        validate: {
                            MatchRuleLength: minLength, // ความยาวที่กำหนดให้ตรวจสอบ
                            MatchString: matchSubstring, // ตัวอักษรที่ตรงกัน
                        }
                    });
                    break; // หยุดตรวจสอบเมื่อพบข้อผิดพลาด
                }
            }
        }
    }
};





module.exports = { getPasswordPolicyData, validateLength, validateNumbers, validateSpecialCharacters, validateEnglishOnly , validatePasswordSimilarityRule }