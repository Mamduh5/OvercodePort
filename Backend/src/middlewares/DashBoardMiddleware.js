const { knex } = require('../libs/knex.js');
const {
    PASSWORD_POLICY
} = require('../enum/index.js')
const { getQueryDynamiCMD } = require('../../src/libs/knex.js')

const GetDashboard = () => async (ctx, next) => {
    const columnMap = {
        STATUS: `status`,
        NAME:'name',
        REQMINLENGTH:'require_min_length',
        REQMAXLENGTH:'require_max_length',
        REQLOWER:'require_lowercase',
        REQUPPER:'require_uppercase',
        REQNUMBER:'require_numbers',
        REQSPECIAL:'require_special_characters',
        ALLOWENG:'allow_english_only'

    };
    const queries = await Promise.all(
        Object.entries(columnMap).map(async ([key, value]) => ({
            [key]: await getQueryDynamiCMD(key, value),
        }))
    );
    const queryStatus = queries.find((q) => q.STATUS)?.STATUS;
    const queryName = queries.find((q) => q.NAME)?.NAME;
    const queryReqMinLength = queries.find((q) => q.REQMINLENGTH)?.REQMINLENGTH;
    const queryReqMaxLength = queries.find((q) => q.REQMAXLENGTH)?.REQMAXLENGTH;
    const queryReqLowerCase = queries.find((q) => q.REQLOWER)?.REQLOWER;
    const queryReqUpperCase = queries.find((q) => q.REQUPPER)?.REQUPPER;
    const queryReqNumber = queries.find((q) => q.REQNUMBER)?.REQNUMBER;
    const queryReqSpecial = queries.find((q) => q.REQSPECIAL)?.REQSPECIAL;
    const queryReqAllowEng = queries.find((q) => q.ALLOWENG)?.ALLOWENG;

    const passwordPolicyData = await knex(PASSWORD_POLICY)
    .select(
        "password_policy_id AS PasswordPolicyID",
        knex.raw(queryName),
        knex.raw(queryReqMinLength),
        "min_length AS MinLengthRequire",
        knex.raw(queryReqMaxLength),
        "max_length AS MaxLengthRequire",
        knex.raw(queryReqLowerCase),
        "lowercase_length AS LowerCaseLengthRequire",
        knex.raw(queryReqUpperCase),
        "uppercase_length AS UpperCaseLengthRequire",
        knex.raw(queryReqNumber),
        "numbers_length AS NumberLengthRequire",
        knex.raw(queryReqSpecial),
        "special_characters_length AS SpecialCharacterRequire",
        "allowed_special_characters AS AllowedSpecialCharacter",
        knex.raw(queryReqAllowEng),
        knex.raw(queryStatus)
        
    )
    .where({ status: 102})
    const updatedPasswordPolicyData = passwordPolicyData.map((i) => (
        {
            PasswordPolicyID:i.PasswordPolicyID,
            Mode:i.name,
            
            RequireMinLength:i.require_min_length,
            MinimumMinLengthRequire:i.MinLengthRequire,
            
            RequireMaxnLength:i.require_max_length,
            MinimumMaxLengthRequire:i.MaxLengthRequire,
            
            RequireLowerCaseRequire:i.require_lowercase,
            MinimumLowerCaseLengthRequire:i.LowerCaseLengthRequire,

            RequreUpperCaseRequire:i.require_uppercase,
            MinimumUpperCaseLengthRequire:i.UpperCaseLengthRequire,

            RequireNumberLength:i.require_numbers,
            MinimumNumberLengthRequire:i.NumberLengthRequire,

            RequireSpercialCharacter:i.require_special_characters,
            MinimumSpecialCharacterRequire:i.SpecialCharacterRequire,
            ListAllowedSpecialCharacter:i.AllowedSpecialCharacter,

            AllowEnglishOnly:i.allow_english_only,
            Status:i.status
      }));
    ctx.result = updatedPasswordPolicyData[0];
    return next();
}
module.exports = { GetDashboard }
