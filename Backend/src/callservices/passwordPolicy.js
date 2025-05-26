const {getPasswordPolicyData,validateLength,validateNumbers ,validateSpecialCharacters , validateEnglishOnly , validatePasswordSimilarityRule } = require('../controllers/PasswordPolicyController')

const passwordPolicyValidate = async (password,email) => {
  const password_policy_data = await getPasswordPolicyData();
  if (!password_policy_data) return false;
  const errors = [];
  validateLength(password, password_policy_data, errors);
  validateNumbers(password, password_policy_data, errors);
  validateSpecialCharacters(password, password_policy_data, errors);
  validateEnglishOnly(password, password_policy_data, errors);
  validatePasswordSimilarityRule(password, email, password_policy_data, errors)

  return { status: errors.length === 0, errors: errors };
};




module.exports = { passwordPolicyValidate }