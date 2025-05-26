const seeder = require('../seeder/seeder.js')
const {
  ADMINS,
  PASSWORD_POLICY,
  REQUEST_SENDING_EMAIL,
  ADMIN_2FA_REQUEST,
  AUTH_LOGIN_LOGS,
  AUTH_ADMIN_CHANGE_LOGS,
  ADMIN_DATA_TRACKING,
} = require('../enum/index.js')
const {
  admins,
  password_policy,
  request_sending_email,
  admin_2fa_request,
  auth_login_logs,
  auth_admin_change_logs,
  admin_data_tracking,
} = seeder
const { knex } = require('./knex.js')

const MasterDataCreateKnexSql = async () => {
  const adminsData = await initializeMasterData(ADMINS, admins[0])
  const password_policyData = await initializeMasterData(PASSWORD_POLICY, password_policy[0])
  const admin_data_trackingData = await initializeMasterData(ADMIN_DATA_TRACKING, admin_data_tracking[0])

  await initializeMasterData(REQUEST_SENDING_EMAIL, request_sending_email[0])
  await initializeMasterData(ADMIN_2FA_REQUEST, admin_2fa_request[0])
  await initializeMasterData(AUTH_LOGIN_LOGS, auth_login_logs[0])
  await initializeMasterData(AUTH_ADMIN_CHANGE_LOGS, auth_admin_change_logs[0])
  // await initializeMasterData(AUTH_PERMISSION_CHANGE_LOGS, auth_permission_change_logs[0])

  await createModels(admins[0], adminsData, ADMINS, 'email')
  await createModels(password_policy[0], password_policyData, PASSWORD_POLICY, 'code')
  await createModels(admin_data_tracking[0], admin_data_trackingData, ADMIN_DATA_TRACKING, 'code')

  async function createModels(SeederData, OldData, TABLENAME, DUPCASE) {
    let { data: NewData } = SeederData
    if (OldData === undefined) OldData = []
    if (NewData && OldData && NewData.length !== OldData.length) {
      const createData = []
      for (const key in NewData) {
        if (Object.hasOwn(NewData, key)) {
          const NewwData = NewData[key]
          const isFound = OldData.find(v => v[DUPCASE] == NewwData[DUPCASE])
          if (!isFound) {
            createData.push(NewwData)
          }
        }
      }
      if (createData.length) await knex(TABLENAME).insert(createData)
    }
  }
  return 'Set MasterData MYsql is success.'
}

const initializeMasterData = async (TABLE, RESULT) => {
  try {
    const { schema } = RESULT
    const tableExists = await knex.schema.hasTable(TABLE)

    if (!tableExists) {
      await createTable(TABLE, schema)
    } else {
      const Data = await knex(TABLE).select('*')
      return Data
    }
  } catch (error) {
    console.error('Error initializing master data:', error)
    throw error
  }
}

const addColumn = (tableBuilder, columnName, columnProps) => {
  const { type, length, primary, notNullable, unique, defaultTo, values, references, comment, precision, scale } = columnProps

  let column
  switch (type) {
    case 'increments':
      column = tableBuilder.increments(columnName)
      break
    case 'integer':
      column = tableBuilder.integer(columnName).unsigned()
      if (references) {
        column.references(references.column).inTable(references.table).onDelete('CASCADE').onUpdate('CASCADE')
      }
      break
    case 'float':
      column = tableBuilder.float(columnName, precision || 8, scale || 2)
      break
    case 'string':
      column = tableBuilder.string(columnName, length || 255)
      if (references) {
        column.references(references.column).inTable(references.table).onDelete('CASCADE').onUpdate('CASCADE')
      }
      break
    case 'timestamp':
      column = tableBuilder.timestamp(columnName)
      if (defaultTo === 'now') column.defaultTo(knex.fn.now())
      break
    case 'enum':
      column = tableBuilder.enum(columnName, values)
      break
    case 'decimal':
      column = tableBuilder.decimal(columnName, precision || 9, scale || 6)
      break
    default:
      throw new Error(`Unsupported type: ${type}`)
  }
  if (primary) column.primary()
  if (notNullable) column.notNullable()
  if (unique) column.unique()
  if (comment) column.comment(comment)
}

const createTable = async (TABLE, schema) => {
  await knex.schema.createTable(TABLE, tableBuilder => {
    tableBuilder.collate('utf8mb4_general_ci')
    let uniqueLink = []
    Object.entries(schema).forEach(([columnName, columnProps]) => {
      addColumn(tableBuilder, columnName, columnProps)
      if (columnProps.unique_link === true) uniqueLink.push(columnName)
    })
    if (uniqueLink.length > 1) tableBuilder.unique(uniqueLink)
  })
}

module.exports = { MasterDataCreateKnexSql }