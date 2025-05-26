
const appConfig = require('../../configLoader'); 

const { host, port, username, password, database } = appConfig.databaseknexsql;

// console.log(host, port, username, password, database)

const mainseeder = require('../seeder/main_seeder.json')
const password_policy_require = require('../seeder/password_policy.json')

const knex = require('knex')({
  client: 'mysql2',
  // client: 'pg',
  connection: {
    host,
    user: username,
    password,
    database,
    port
  }
});

  const getQueryDynamiCMD = async (value, column) => {
    try {
      const queryMap = {
        STATUS: mainseeder?.status?.querystring,

        REQMINLENGTH:password_policy_require[0]?.schema?.require_min_length?.querystring,
        REQMAXLENGTH:password_policy_require[0]?.schema?.require_max_length?.querystring,
        REQLOWER:password_policy_require[0]?.schema?.require_lowercase?.querystring,
        REQUPPER:password_policy_require[0]?.schema?.require_uppercase?.querystring,
        REQNUMBER:password_policy_require[0]?.schema?.require_numbers?.querystring,
        REQSPECIAL:password_policy_require[0]?.schema?.require_special_characters?.querystring,
        ALLOWENG:password_policy_require[0]?.schema?.allow_english_only?.querystring,
        NAME:password_policy_require[0]?.schema?.name?.querystring,
        PASSWORFSIMILAR:password_policy_require[0]?.schema?.require_password_similarity_rule?.querystring,

      };
  
      let queries = queryMap[value];
      
      queries = queries.replace(/\$\{[^}]+\}/g, column);
      return queries;
    } catch (err) {
      console.error(err.message);
      return null;
    }
  };
  
  const closeKnexConnectionForTest = async () => {
    try {
      await knex.raw("SELECT 1");
      await knex.destroy();
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  };
  
module.exports = { knex, getQueryDynamiCMD , closeKnexConnectionForTest };