const authentication_responses = require('./authentication_responses.json')
const data_responses = require('./data_responses.json')
const error_responses = require('./error_responses.json')
const header_responses = require('./header_responses.json')
const validate_responses = require('./validate_responses.json')
const values_responses = require('./values_responses.json')
const mainseeder = require('./main_seeder.json')
const languages = require('./languages.json')
const admins = require('./admin.json')
const password_policy = require('./password_policy.json')
const request_sending_email = require('./request_sending_email.json')
const admin_2fa_request = require('./admin_2fa_request.json')
const auth_login_logs = require('./auth_login_logs.json') 
const auth_admin_change_logs = require('./auth_admin_change_logs.json')
const admin_data_tracking = require('./admin_data_tracking.json')
admins[0].schema = {
    ...admins[0].schema,
    ...mainseeder,
};
password_policy[0].schema = {
    ...password_policy[0].schema,
    ...mainseeder,
};
request_sending_email[0].schema = {
    ...request_sending_email[0].schema,
    ...mainseeder,
};
admin_2fa_request[0].schema = {
    ...admin_2fa_request[0].schema,
    ...mainseeder,
};
auth_login_logs[0].schema = {
    ...auth_login_logs[0].schema,
    ...mainseeder,
};
auth_admin_change_logs[0].schema = {
    ...auth_admin_change_logs[0].schema,
    ...mainseeder,
};
admin_data_tracking[0].schema = {
    ...admin_data_tracking[0].schema,
    ...mainseeder,
};

// auth_permission_change_logs[0].schema = {
//     ...auth_permission_change_logs[0].schema,
//     ...mainseeder,
// }

// merchants_data_tracking[0].schema = {
//     ...merchants_data_tracking[0].schema,
//     ...mainseeder,
// }
const responses = [
    authentication_responses,
    data_responses,
    error_responses,
    header_responses,
    validate_responses,
    values_responses
]
const responsesNewSet = [
    ...authentication_responses['responses'],
    ...data_responses['responses'],
    ...error_responses['responses'],
    ...header_responses['responses'],
    ...validate_responses['responses'],
    ...values_responses['responses']
]
module.exports = {
    mainseeder,
    languages,
    responsesNewSet,
    responses,
    admins,
    password_policy,
    request_sending_email,
    admin_2fa_request,
    auth_login_logs,
    auth_admin_change_logs,
    admin_data_tracking,
    // auth_permission_change_logs,
}