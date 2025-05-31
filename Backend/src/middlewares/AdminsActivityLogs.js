const { insertRecord } = require('../libs/mysql.js')
const { DateTime } = require('luxon')
const {
  // ADMIN_ACTIVITY_LOGS,
  AUTH_LOGIN_LOGS,
  AUTH_ADMIN_CHANGE_LOGS,
  AUTH_PERMISSION_CHANGE_LOGS,
  ROLE_MODEL,
  MERCHANTS,
  BRANCH,
  ABILITY_MODEL,
  ADMINS,
  PERMISSION_DETAIL_NEW,
  METHOD_MODEL,
  SUB_ABILITY_MODEL,

} = require('../enum/index.js');
const { knex } = require('../libs/knex.js');
const { responseFormat } = require('../libs/formatResponse.js')
const { throwError } = require('../libs/errorService.js');
const { getClientIp, getUserAgent } = require('../libs/getClientIp.js');
const configs = require('../prefix/index.js')
const config = require('config')
const prefix = configs.service.api
const { getQueryDynamiCMD } = require('../libs/knex.js');


const includeRoutes = [prefix + '/token/login', prefix + '/token/logout', prefix + '/token/login/verify/otp'];

const setAction = (action, action_type) => async (ctx, next) => {
  ctx.action = action;
  ctx.check_pass = true;
  ctx.action_type = action_type;

  await next();

};

const setTypePermission = (action_type) => async (ctx, next) => {
  ctx.action_type = action_type;
  await next();

};

const authPreCheck = () => async (ctx, next) => {
  ctx.check_pass = false;
  ctx.action_type = 0;
  await next();
};

const authMonitorPermissionChange = () => async (ctx, next) => {
  try {

    const currentTime = DateTime.utc();
    const adminIdInAction = ctx.admin_id;
    const targetPermisssion = ctx.target_permission_id;
    const action = ctx.action_type;
    const timestamp = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
    const createdat = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
    const updatedat = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
    const oldDataId = ctx.old_data_id || null;
    const newDataId = ctx.new_data_id || null;
    const connectionStatus = (ctx.connection_status === undefined || ctx.connection_status === null) ? 1 : ctx.connection_status;
    const ipAddress = getClientIp(ctx);
    const userAgent = getUserAgent(ctx);
    const status = 102;

    await knex(AUTH_PERMISSION_CHANGE_LOGS).insert({

      admin_id_in_action: adminIdInAction,
      target_permission_id: targetPermisssion,
      action_type: action,
      timestamp: timestamp,
      old_data_id: oldDataId,
      new_data_id: newDataId,
      connection_status: connectionStatus,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: status,
      created_at: createdat,
      updated_at: updatedat
    });

    return next();
  } catch (error) {
    throw throwError(error, 'authMonitorPermissionChange')
  }
};

const authMonitorAdminMovement = () => async (ctx, next) => {

  try {
    const currentTime = DateTime.utc();
    const adminIdInAction = ctx.admin_id;
    const targetAdminId = ctx.target_admin_id || null;
    const action = ctx.action;
    const timestamp = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
    const createdat = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
    const updatedat = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
    const oldDataId = ctx.old_data_id || null;
    const newDataId = ctx.new_data_id || null;
    const ActionRoleId = ctx.request.query.RoleModelId || 1;
    const ipAddress = getClientIp(ctx);
    const userAgent = getUserAgent(ctx);
    const status = 200;

    console.log(`Admin ID in Action: ${adminIdInAction}, Target Admin ID: ${targetAdminId}, Action: ${action}, Timestamp: ${timestamp}, Old Data ID: ${oldDataId}, New Data ID: ${newDataId}, Action Role ID: ${ActionRoleId}, IP Address: ${ipAddress}, User Agent: ${userAgent}, Status: ${status}`);

    await knex(AUTH_ADMIN_CHANGE_LOGS).insert({

      admin_id_in_action: adminIdInAction,
      target_admin_id: targetAdminId,
      action_type: action,
      timestamp: timestamp,
      old_data_id: oldDataId,
      new_data_id: newDataId,
      performing_action_using_role_model_id: ActionRoleId,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: status,
      created_at: createdat,
      updated_at: updatedat
    });


    return next();
  } catch (error) {
    throw throwError(error, 'authMonitorAdminMovement')
  }
};

const authLoggerMiddleware = async (ctx, next) => {
  try {
    await next();

    if (includeRoutes.includes(ctx.path)) {
      const currentTime = DateTime.utc();

      const adminId = ctx.admin_id || null;
      const email = ctx.email || ctx.request.body?.Email || null;
      const ipAddress = getClientIp(ctx);
      const userAgent = getUserAgent(ctx);
      const reasonOfFialure = ctx.reason_of_failure || null;
      const failedAttemptCount = ctx.failed_attempt_count || 0;
      const timestamp = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
      const createdat = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
      const updatedat = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');

      if (ctx.check_pass === true) {

        switch (ctx.action_type) {
          case 1:
            ctx.action = "LOGIN_SUCCESS";
            ctx.status = 200;
            break;
          case 2:
            ctx.action = "LOGIN_2FA_SUCCESS";
            ctx.status = 200;
            break;
          case 3:
            ctx.action = "LOGOUT_SUCCESS";
            ctx.status = 200;
            break;
          case 4:
            ctx.action = "EXTEND_COOKIES_SUCCESS";
            ctx.status = 200;
            break;

          default:
            ctx.action = "UNKNOW_ACTION";
            ctx.status = 200;
            break;
        }
      }

      const status = ctx.status;

      const action = ctx.action;


      await knex(AUTH_LOGIN_LOGS).insert({
        admin_id: adminId,
        email: email,
        timestamp: timestamp,
        action: action,
        ip_address: ipAddress,
        user_agent: userAgent,
        reason_of_failure: reasonOfFialure,
        failed_attempt_count: failedAttemptCount,
        request_from_portal: 1,
        status: status,
        created_at: createdat,
        updated_at: updatedat
      });
    }



  } catch (error) {
    console.error("Error logging authentication event:", error);
  }
};

const displayLoginLogs = () => async (ctx, next) => {
  try {
    const columnMap = {
      ADMIN_ID: 'admin_id',
      EMAIL: 'email',
      TIMESTAMP: 'timestamp',
      ACTION: 'action',
      IP_ADDRESS: 'ip_address',
      USER_AGENT: 'user_agent',
      REASON_OF_FAILURE: 'reason_of_failure',
      STATUS: 'status',
    };

    const {
      SortColumn = 'TIMESTAMP',
      SortOrder = 'DESC',
      Page = 1,
      PageSize = 100,
      SearchTerm,
      StartDate,
      EndDate,
    } = ctx.request.query;

    const sortBy = columnMap[SortColumn.toUpperCase()] || 'timestamp';
    const sortDirection = SortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const offset = (parseInt(Page, 10) - 1) * parseInt(PageSize, 10);
    const limit = parseInt(PageSize, 10);

    const searchFilter = (SearchTerm?.trim())
      ? createLoginSearchFilter(SearchTerm)
      : null;

    const TotalRecords = await fetchLoginLogCount(searchFilter, StartDate, EndDate);

    if (TotalRecords === 0) {
      ctx.body = responseFormat({}, 'GET_DATA_NOT_FOUND', ctx.language);
      return;
    }

    const logData = await fetchLoginLogData(sortBy, sortDirection, offset, limit, searchFilter, StartDate, EndDate);

    if (Page > Math.ceil(TotalRecords / limit)) {
      ctx.body = responseFormat({}, "GET_DATA_NOT_FOUND", ctx.language);
      return;
    }

    const LogsData = constuctLoginLogData(logData);

    ctx.result = {
      CurrentPage: parseInt(Page, 10),
      PageSize: limit,
      TotalRecords: TotalRecords,
      TotalPages: Math.ceil(TotalRecords / limit),
      LogsData
    };

    return next();
  } catch (error) {
    throw throwError(error, 'displayLoginLogs');
  }
};

const createLoginSearchFilter = (SearchTerm) => {
  return (builder) => {
    if (SearchTerm?.trim()) {
      builder.where(function () {
        this.where('auth_logs_id', SearchTerm)
          .orWhere('email', 'like', 'like', `%${SearchTerm}%`)
          .orWhere('action', 'like', `%${SearchTerm}%`)
      });
    }
  };
};

const getStartOfDay = (date) => {
  return `${date} 00:00:00`;
};

const getEndOfDay = (date) => {
  return `${date} 23:59:59`;
};

const fetchLoginLogCount = async (searchFilter, StartDate, EndDate) => {
  const totalLogsQuery = knex(AUTH_LOGIN_LOGS)
    .count({ count: `${AUTH_LOGIN_LOGS}.auth_logs_id` })
    .first();

  if (searchFilter) totalLogsQuery.modify(searchFilter);

  if (StartDate) totalLogsQuery.where('timestamp', '>=', getStartOfDay(StartDate));
  if (EndDate) totalLogsQuery.where('timestamp', '<=', getEndOfDay(EndDate));

  const totalLogs = await totalLogsQuery;

  return parseInt(totalLogs?.count || 0, 10);

}

const fetchLoginLogData = async (sortBy, sortDirection, offset, limit, searchFilter, StartDate, EndDate) => {
  const query = knex(AUTH_LOGIN_LOGS)
    .select('admin_id', 'email', 'timestamp', 'action', 'ip_address', 'user_agent', 'reason_of_failure', 'status', 'request_from_portal')
    .orderBy(sortBy, sortDirection)
    .limit(limit)
    .offset(offset);

  if (searchFilter) query.modify(searchFilter);

  if (StartDate) query.where('timestamp', '>=', getStartOfDay(StartDate));
  if (EndDate) query.where('timestamp', '<=', getEndOfDay(EndDate));

  return await query;
}

const constuctLoginLogData = (logData) => {
  return logData.map((l) => ({
    AdminId: l.admin_id,
    Email: l.email,
    Timestamp: l.timestamp,
    Action: l.action,
    IpAddress: l.ip_address,
    IsCenter: l.request_from_portal === 1,
    UserAgent: l.user_agent,
    ReasonOfFailure: l.reason_of_failure,
    Status: l.status,
  }));
}










const displayAdminChangeLogs = () => async (ctx, next) => {
  try {
    const columnMap = {
      ADMIN_ID_IN_ACTION: 'admin_id_in_action',
      TARGET_ADMIN_ID: 'target_admin_id',
      ACTION_TYPE: 'action_type',
      TIMESTAMP: 'timestamp',
      OLD_DATA_ID: 'old_data_id',
      NEW_DATA_ID: 'new_data_id',
      IP_ADDRESS: 'ip_address',
      USER_AGENT: 'user_agent',
      STATUS: 'status',
    };
    const {
      SortColumn = 'TIMESTAMP',
      SortOrder = 'DESC',
      Page = 1,
      PageSize = 100,
      SearchTerm,
      StartDate,
      EndDate
    } = ctx.request.query;
    const sortBy = columnMap[SortColumn.toUpperCase()] || 'timestamp';
    const sortDirection = SortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const offset = (parseInt(Page, 10) - 1) * parseInt(PageSize, 10);
    const limit = parseInt(PageSize, 10);
    const searchFilter = SearchTerm?.trim() ? createAdminLogSearchFilter(SearchTerm) : null;
    const TotalRecords = await fetchAdminLogCount(searchFilter, StartDate, EndDate);

    if (TotalRecords <= 0) {
      ctx.body = responseFormat({}, 'GET_DATA_NOT_FOUND', ctx.language);
      return;
    }
    const logData = await fetchAdminLogData(sortBy, sortDirection, offset, limit, searchFilter, StartDate, EndDate);


    if (Page > Math.ceil(TotalRecords / limit)) {
      ctx.body = responseFormat({}, "GET_DATA_NOT_FOUND", ctx.language);
      return;
    }
    const LogsData = constructAdminLogData(logData);
    ctx.result = {
      CurrentPage: parseInt(Page, 10),
      PageSize: limit,
      TotalRecords,
      TotalPages: Math.ceil(TotalRecords / limit),
      LogsData,
    };

    return next();
  } catch (error) {
    throw throwError(error, 'displayAdminChangeLogs');
  }
};

const fetchAdminLogCount = async (searchFilter, StartDate, EndDate) => {
  const totalLogsQuery = knex(AUTH_ADMIN_CHANGE_LOGS)
    .count({ count: `${AUTH_ADMIN_CHANGE_LOGS}.admin_id_in_action` })
    .first();
  if (searchFilter) totalLogsQuery.modify(searchFilter);

  if (StartDate) totalLogsQuery.where('timestamp', '>=', getStartOfDay(StartDate));
  if (EndDate) totalLogsQuery.where('timestamp', '<=', getEndOfDay(EndDate));

  const totalLogs = await totalLogsQuery;

  return parseInt(totalLogs?.count || 0, 10);
};
const fetchAdminLogData = async (sortBy, sortDirection, offset, limit, searchFilter, StartDate, EndDate) => {
  const query = knex(AUTH_ADMIN_CHANGE_LOGS)
    .select(
      'admins1.email as admin_email',
      'admins1.admin_id as admin_id_in_action',
      'admins2.email as target_admin_email',
      'auth_admin_change_logs.action_type',
      knex.raw(`
        CASE
          WHEN auth_admin_change_logs.action_type = 1 THEN 'CREATE'
          WHEN auth_admin_change_logs.action_type = 2 THEN 'UPDATE'
          WHEN auth_admin_change_logs.action_type = 3 THEN 'DELETE'
          WHEN auth_admin_change_logs.action_type = 4 THEN 'PASSWROD_CHANGE'
          ELSE 'UNKNOWN'
        END AS action_type_readable
      `),
      'auth_admin_change_logs.performing_action_using_role_model_id',
      'auth_admin_change_logs.delail_why_is_it_need_to_be_delete',
      'auth_admin_change_logs.name_of_approver',
      'auth_admin_change_logs.timestamp',
      'admin_data_tracking_old.first_name as old_first_name',
      'admin_data_tracking_old.last_name as old_last_name',
      'admin_data_tracking_new.first_name as new_first_name',
      'admin_data_tracking_new.last_name as new_last_name',
      'auth_admin_change_logs.ip_address',
      'auth_admin_change_logs.user_agent',
      'auth_admin_change_logs.status',

      'role_model.role_name as role_name',
    )
    .leftJoin('admins as admins1', 'auth_admin_change_logs.admin_id_in_action', 'admins1.admin_id')
    .leftJoin('admins as admins2', 'auth_admin_change_logs.target_admin_id', 'admins2.admin_id')
    .leftJoin('admin_data_tracking as admin_data_tracking_old', function () {
      this.on('auth_admin_change_logs.old_data_id', '=', 'admin_data_tracking_old.admin_data_tracking_id')
        .andOn('admin_data_tracking_old.type_of_data', '=', knex.raw('?', [1]));
    })
    .leftJoin('admin_data_tracking as admin_data_tracking_new', function () {
      this.on('auth_admin_change_logs.new_data_id', '=', 'admin_data_tracking_new.admin_data_tracking_id')
        .andOn('admin_data_tracking_new.type_of_data', '=', knex.raw('?', [2]));
    })

    .leftJoin('role_model', 'auth_admin_change_logs.performing_action_using_role_model_id', 'role_model.role_model_id')
    .orderBy(sortBy, sortDirection)
    .limit(limit)
    .offset(offset);

  if (searchFilter) query.modify(searchFilter);
  if (StartDate) query.where('auth_admin_change_logs.timestamp', '>=', getStartOfDay(StartDate));
  if (EndDate) query.where('auth_admin_change_logs.timestamp', '<=', getEndOfDay(EndDate));

  return await query; // ✅ Now the query will return only data that matches the date filters
};
const constructAdminLogData = (logData) => {
  return logData.map((l) => ({
    AdminIdInAction: l.admin_id_in_action,
    AdminEmail: l.admin_email,
    TargetAdminEmail: l.target_admin_email,
    ActionType: l.action_type_readable,
    Timestamp: l.timestamp,
    OldFirstName: l.old_first_name,
    OldLastName: l.old_last_name,
    NewFirstName: l.new_first_name,
    NewLastName: l.new_last_name,
    ActionWithRoleName: l.role_name,
    ReasonOfDeleted: l.delail_why_is_it_need_to_be_delete,
    NameOfAprover: l.name_of_approver,
    IpAddress: l.ip_address,
    UserAgent: l.user_agent,
    Status: l.status,
  }));
};
const createAdminLogSearchFilter = (SearchTerm) => {
  return (builder) => {
    if (SearchTerm) {
      builder
        .where('admin_id_in_action', SearchTerm)
        .orWhere(function () {
          this.whereRaw(
            `
            CASE
              WHEN auth_admin_change_logs.action_type = 1 THEN 'CREATE'
              WHEN auth_admin_change_logs.action_type = 2 THEN 'UPDATE'
              WHEN auth_admin_change_logs.action_type = 3 THEN 'DELETE'
              WHEN auth_admin_change_logs.action_type = 4 THEN 'PASSWROD_CHANGE'
              ELSE 'UNKNOWN'
            END LIKE ?
          `,
            [`%${SearchTerm.toUpperCase()}%`]
          );
        });
    }
  };
};




// const displayPermissionLogs = () => async (ctx, next) => {
//   try {
//     const columnMap = {
//       ADMIN_ID_IN_ACTION: 'admin_id_in_action',
//       TARGET_PERMISSON_ID: 'target_permission_id',
//       ACTION_TYPE: 'action_type',
//       TIMESTAMP: 'timestamp',
//       OLD_DATA_ID: 'old_data_id',
//       NEW_DATA_ID: 'new_data_id',
//       IP_ADDRESS: 'ip_address',
//       USER_AGENT: 'user_agent',
//       STATUS: 'status',
//       NEWMETHOD: `method_new.method`,
//       TOPICABILITIES: `method_old.topic_ability`,
//       TOPICABILITIESNEW: `method_new.topic_ability`,
//       NEWABILITIESNEW: `ability_new.abilities`,
//       CONNECTION_STATUS: `permission_detail_new.connection_status`,
//       SUBABILITIESNEW: `sub_ability_new.sub_abilities`,
//     };

//     const queries = await Promise.all(
//       Object.entries(columnMap).map(async ([key, value]) => ({
//         [key]: await getQueryDynamiCMD(key, value),
//       }))
//     );

//     const queryTopicMethodOld = queries.find((q) => q.TOPICABILITIESNEW)?.TOPICABILITIESNEW;
//     const queryNewMethodNew = queries.find((q) => q.NEWMETHOD)?.NEWMETHOD;
//     const queryConnectionStatus = queries.find((q) => q.CONNECTION_STATUS)?.CONNECTION_STATUS;

//     const queryAbilitiesNew = queries.find((q) => q.NEWABILITIESNEW)?.NEWABILITIESNEW;
//     const querySubAbilitiesNew = queries.find((q) => q.SUBABILITIESNEW)?.SUBABILITIESNEW;

//     const {
//       SortColumn = 'TIMESTAMP',
//       SortOrder = 'DESC',
//       Page = 1,
//       PageSize = 100,
//       SearchTerm,
//       StartDate,
//       EndDate,
//     } = ctx.request.query;

//     const sortBy = columnMap[SortColumn.toUpperCase()] || 'timestamp';
//     const sortDirection = SortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
//     const offset = (parseInt(Page, 10) - 1) * parseInt(PageSize, 10);
//     const limit = parseInt(PageSize, 10);

//     const searchFilter = SearchTerm?.trim() ? createPermissionSearchFilter(SearchTerm) : null;

//     const TotalRecords = await fetchPermissionLogCount(searchFilter, StartDate, EndDate);   

//     const logData = await fetchPermissionLogData({
//       sortBy,
//       sortDirection,
//       offset,
//       limit,
//       searchFilter,
//       StartDate,
//       EndDate,
//       dynamicQueries: {
//         queryTopicMethodOld,
//         queryNewMethodNew,
//         queryConnectionStatus,
//         queryAbilitiesNew,
//         querySubAbilitiesNew
//       }
//     });


//     if (!logData || logData.length === 0) {
//       ctx.body = responseFormat({}, "GET_DATA_NOT_FOUND", ctx.language);
//       return;
//     }

//     const LogsData = constructPermissionLogData(logData);

//     ctx.result = {
//       CurrentPage: parseInt(Page, 10),
//       PageSize: limit,
//       TotalRecords: TotalRecords,
//       TotalPages: Math.ceil(TotalRecords / limit),
//       LogsData,
//     };

//     return next();
//   } catch (error) {
//     throw throwError(error, 'displayPermissionLogs');
//   }
// };

// const constructPermissionLogData = (logData) => {
//   return logData.map((l) => ({
//     AdminIdInAction: l.admin_id_in_action,
//     AdminEmail: l.admin_email || null,
//     TargetAdminEmail: l.target_permission_id || null,
//     ActionType: l.action_type_readable,
//     Timestamp: l.timestamp,
//     IpAddress: l.ip_address,
//     UserAgent: l.user_agent,
//     Status: l.status,
//     ConnectionStatus: l.connection_status,
//     RoleName: l.role_name,
//     MerchantCode: l.merchant_code,
//     BranchCode: l.branch_code,
//     NewMethod: l.new_method_readable,
//     TopicNew: l.topic_of_ability_new,
//     Ability_new: l.ability_readable_new,
//     SubAbility_new: l.readable_subability_new,
//   }));
// };


// const fetchPermissionLogData = async ({sortBy, sortDirection, offset, limit, searchFilter, StartDate, EndDate, dynamicQueries}) => {
//   const query = knex(AUTH_PERMISSION_CHANGE_LOGS)
//   .select(
//     `${AUTH_PERMISSION_CHANGE_LOGS}.admin_id_in_action`,
//     `${AUTH_PERMISSION_CHANGE_LOGS}.action_type`,
//     `${AUTH_PERMISSION_CHANGE_LOGS}.timestamp`,
//     `${AUTH_PERMISSION_CHANGE_LOGS}.ip_address`,
//     knex.raw(`COALESCE((${dynamicQueries.queryConnectionStatus}), 'UNKNOWN') as connection_status`),
//     `${AUTH_PERMISSION_CHANGE_LOGS}.user_agent`,
//     `${AUTH_PERMISSION_CHANGE_LOGS}.status`,
//     knex.raw(`
//       CASE
//         WHEN ${AUTH_PERMISSION_CHANGE_LOGS}.action_type = 1 THEN 'CREATE'
//         WHEN ${AUTH_PERMISSION_CHANGE_LOGS}.action_type = 2 THEN 'UPDATE'
//         WHEN ${AUTH_PERMISSION_CHANGE_LOGS}.action_type = 3 THEN 'DELETE'
//         ELSE 'UNKNOWN' 
//       END AS action_type_readable
//     `),
//     `${ADMINS}.email as admin_email`,
//     `${ROLE_MODEL}.role_name as role_name`,
//     `${MERCHANTS}.merchant_code as merchant_code`,
//     `${BRANCH}.branch_code as branch_code`,
//     `${PERMISSION_DETAIL_NEW}.permission_detail_id as target_permission_id`,
//     knex.raw(`COALESCE((${dynamicQueries.queryNewMethodNew}), 'UNKNOWN') as new_method_readable`),
//     knex.raw(`COALESCE((${dynamicQueries.queryTopicMethodOld}), 'UNKNOWN') as topic_of_ability_new`),
//     knex.raw(`COALESCE((${dynamicQueries.queryAbilitiesNew}), 'UNKNOWN') as ability_readable_new`),
//     knex.raw(`COALESCE((${dynamicQueries.querySubAbilitiesNew}), 'UNKNOWN') as readable_subability_new`),

//   )
//   .leftJoin(`${PERMISSION_DETAIL_NEW}`, `${AUTH_PERMISSION_CHANGE_LOGS}.target_permission_id`, `${PERMISSION_DETAIL_NEW}.permission_detail_id`)
//   .leftJoin(`${ROLE_MODEL}`, `${PERMISSION_DETAIL_NEW}.role_model_id`, `${ROLE_MODEL}.role_model_id`)
//   .leftJoin(`${ADMINS}`, `${AUTH_PERMISSION_CHANGE_LOGS}.admin_id_in_action`, `${ADMINS}.admin_id`)
//   .leftJoin(`${MERCHANTS}`, `${ROLE_MODEL}.merchant_id`, `${MERCHANTS}.merchant_id`)
//   .leftJoin(`${BRANCH}`, `${ROLE_MODEL}.branch_id`, `${BRANCH}.branch_id`)
//   .leftJoin(`${PERMISSION_DETAIL_NEW} as permission_method_old`, function () {
//     this.on(`${AUTH_PERMISSION_CHANGE_LOGS}.old_data_id`, '=', 'permission_method_old.method_model_id');
//   })
//   .leftJoin(`${PERMISSION_DETAIL_NEW} as permission_method_new`, function () {
//     this.on(`${AUTH_PERMISSION_CHANGE_LOGS}.new_data_id`, '=', 'permission_method_new.method_model_id');
//   })
//   .leftJoin(`${METHOD_MODEL} as method_old`, function () {
//     this.on('permission_method_old.method_model_id', '=', 'method_old.method_model_id');
//   })
//   .leftJoin(`${METHOD_MODEL} as method_new`, function () {
//     this.on('permission_method_new.method_model_id', '=', 'method_new.method_model_id');
//   })
//   .leftJoin(`${ABILITY_MODEL} as ability_old`, function () {
//     this.on('method_old.ability_model_id', '=', 'ability_old.ability_model_id');
//   })
//   .leftJoin(`${ABILITY_MODEL} as ability_new`, function () {
//     this.on('method_new.ability_model_id', '=', 'ability_new.ability_model_id');
//   })
//   .leftJoin(`${SUB_ABILITY_MODEL} as sub_ability_old`, function () {
//     this.on('ability_old.ability_model_id', '=', 'sub_ability_old.mother_ability_model_id');
//   })
//   .leftJoin(`${SUB_ABILITY_MODEL} as sub_ability_new`, function () {
//     this.on('ability_new.ability_model_id', '=', 'sub_ability_new.mother_ability_model_id');
//   })
//   .groupBy(`${AUTH_PERMISSION_CHANGE_LOGS}.auth_permission_change_logs_id`)
//   .orderBy(sortBy, sortDirection)
//   .limit(limit)
//   .offset(offset);


//   if (searchFilter) query.modify(searchFilter);
//   if (StartDate) query.where(`${AUTH_PERMISSION_CHANGE_LOGS}.timestamp`, '>=', getStartOfDay(StartDate));
//   if (EndDate) query.where(`${AUTH_PERMISSION_CHANGE_LOGS}.timestamp`, '<=', getEndOfDay(EndDate));

//   return await query;
// };

// const fetchPermissionLogCount = async (searchFilter, StartDate, EndDate) => {
//   const totalLogsQuery = knex(AUTH_PERMISSION_CHANGE_LOGS)
//     .count({ count: `${AUTH_PERMISSION_CHANGE_LOGS}.auth_permission_change_logs_id` })
//     .first();

//   if (searchFilter) totalLogsQuery.modify(searchFilter);

//   if (StartDate) totalLogsQuery.where('timestamp', '>=', getStartOfDay(StartDate));
//   if (EndDate) totalLogsQuery.where('timestamp', '<=', getEndOfDay(EndDate));

//   const totalLogs = await totalLogsQuery;

//   return parseInt(totalLogs?.count || 0, 10);
// };



// const createPermissionSearchFilter = (SearchTerm) => {
//   if (SearchTerm.includes('to')) {
//     return createPermissionDateRangeFilter(SearchTerm);
//   }

//   return (builder) => {
//     builder
//       .where('admin_id_in_action', SearchTerm)
//       .orWhere(function () {
//         this.whereRaw(
//           `
//             CASE
//               WHEN auth_permission_change_logs.action_type = 1 THEN 'CREATE'
//               WHEN auth_permission_change_logs.action_type = 2 THEN 'UPDATE'
//               WHEN auth_permission_change_logs.action_type = 3 THEN 'DELETE'
//               ELSE 'UNKNOWN'
//             END LIKE ?
//           `,
//           [`%${SearchTerm.toUpperCase()}%`] // assumes you're searching by 'CREATE', 'UPDATE', etc.
//         );
//       });
//   }
// };
// const createPermissionDateRangeFilter = (StartDate, EndDate) => {
//   const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

//   if (isValidDate(StartDate) && isValidDate(EndDate)) {
//     return (builder) => {
//       builder.whereBetween('timestamp', [getStartOfDay(StartDate), getEndOfDay(EndDate)]);
//     };
//   }

//   if (isValidDate(StartDate)) {
//     return (builder) => builder.where('timestamp', '>=', getStartOfDay(StartDate));
//   }

//   if (isValidDate(EndDate)) {
//     return (builder) => builder.where('timestamp', '<=', getEndOfDay(EndDate));
//   }

//   return null; // No filter applied if invalid dates
// };







module.exports = {
  setAction,
  authMonitorAdminMovement,
  authPreCheck,
  authLoggerMiddleware,
  authMonitorPermissionChange,
  setTypePermission,
  displayLoginLogs,
  displayAdminChangeLogs,
  // displayPermissionLogs
}
