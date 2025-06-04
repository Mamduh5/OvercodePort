// npm lib zone
const koa = require('koa')
const Router = require('koa-router')
const helmet = require('koa-helmet')
const koaValidator = require('koa-async-validator')
const chalk = require('chalk')
const http = require('http')
const cors = require('@koa/cors')
const json = require('koa-json')
const error = require('koa-json-error')
const { userAgent } = require('koa-useragent')
const env = require('config')
const _ = require('lodash');
const pm2_env = process.env.NODE_APP_INSTANCE
// Prefix
const configs = require('./prefix/index.js')
const config = require('config')
// model databases
// Libs
const { rateLimitFunction } = require('./libs/rateLimit')
const { bodyParserFunction } = require('./libs/bodyParser')
const { ErrorService, throwError } = require('./libs/errorService')
const { loggerRes } = require('./libs/logger')
const { responseFormat, } = require('./libs/formatResponse')
const { MasterDataCreateKnexSql } = require('./libs/MasterDataCreateKnexSql.js')
const { createEnvFile } = require('./libs/cENVdockerFile.js')
const rabbitMQService = require('./services/rabbitmq');
const { loadAndStartConsumers } = require('./services/consumers/consumerLoader.js');
const cache = require('./libs/redis.js')
// Routes
const Token = require('./routes/Token.js')
const Admins = require('./routes/Admins.js')
const AdminsLogs = require('./routes/AdminsLogs.js')
const Policy = require('./routes/Policy.js')
const Dashboard = require('./routes/Dashboard.js')
const Admin2FA = require('./routes/Admin2FA.js')

// Schedules
// SetTimeout for wait project already start
if (pm2_env === '0' || pm2_env === undefined) {

  switch (process.env.NODE_ENV) {
    case 'test_localhostforuserswitchcase':
    case 'test_localhost': {
      MasterDataCreateKnexSql().then(data => console.log(data))
      break;
    }

    default: {
      setTimeout(() => {
        require('./libs/schedule.js')
      }, 10000)

      MasterDataCreateKnexSql().then(data => console.log(data))
      createEnvFile().then(data => console.log(data))
      break;
    }
  }
}

// cache clean
cache.flushAllRedis()

// init
const app = new koa()
const router = new Router()
const prefix = configs.service.api
const serverEnv = env.get('server')

// pm2 instance checker

app.use(async (ctx, next) => {
  console.log(`Request handled by PM2 instance: ${process.env.NODE_APP_INSTANCE}`)
  await next()
})

// using setting
app.use(helmet())
app.use(json())
app.use(bodyParserFunction())
app.use(userAgent)
app.use(koaValidator())
app.use(loggerRes())
app.use(error(ErrorService))
app.use(rateLimitFunction())


app.proxy = true
// ---------------------------------------- set request header ----------------------------------------
app.use(cors({
  origin: (ctx) => {
    console.log({ ENV: process.env.NODE_ENV });
    switch (process.env.NODE_ENV) {
      case 'localhost':
      case 'developer':
      case 'uat':
      case 'preprod':
      case 'production':
        return '*'
      default:
        return '';
    }
  },
  credentials: true,
}));

app.use(async (ctx, next) => {
  ctx.response.set({
    'Access-Control-Allow-Methods': configs.service.allow.method,
    'Access-Control-Allow-Headers': configs.service.allow.header,
    'Access-Control-Allow-Credentials': "true"
  });
  await next();
  if (process.env.NODE_ENV !== "production") {
    ctx.set("Access-Control-Expose-Headers", "Set-Cookie");
  }
});

// ----------------------------------------router------------------------------------------------------
// first page
router.get(prefix + '/', ctx => {
  ctx.status = 200
  ctx.body = responseFormat({ params: 'base4-koajs-knex-sql-setup' }, 'GET_DATA_SUCCESS', 'EN')
})

router.use(prefix + '/token', Token.routes())
router.use(prefix + '/admins', Admins.routes())
router.use(prefix + '/logs', AdminsLogs.routes())
router.use(prefix + '/policy', Policy.routes())
router.use(prefix + '/dashboard', Dashboard.routes())
router.use(prefix + '/twofa', Admin2FA.routes())
const portPrefix = process.env.PORT || serverEnv.port
const portUsed = +portPrefix + parseInt(process.env.NODE_APP_INSTANCE || 0, 10)

app.use(router.routes())
app.use(router.allowedMethods())

// 400 bad request
app.use(async ctx => {
  ctx.status = 404
  ctx.body = responseFormat({}, 'PAGE_NOT_FOUND', 'EN')
})

// ----------------------------------------server-listen-----------------------------------------------
// start server

async function startApplication() {
    try {
        // 1. Connect to RabbitMQ
        await rabbitMQService.connectRabbitMQ(); // <--- Call connectRabbitMQ here!

        // 2. Start any RabbitMQ consumers if this app needs to receive messages
        // Start all your consumers dynamically
        await loadAndStartConsumers(); // <--- Call the loader here

        // 3. Start the HTTP server
        if (process.env.NODE_ENV === 'test_localhostforuserswitchcase' || process.env.NODE_ENV === 'test_localhost') {
            module.exports = app;
        } else {
            const server = app.listen(process.env.PORT || portUsed, () => {
                console.log(
                    `===================================================
Start Server: ${chalk.cyan(serverEnv.host)}:${chalk.cyan(portUsed)}
Deploy Mode: ${chalk.yellow(process.env.NODE_ENV)}
PM2 instance: ${chalk.gray(process.env.NODE_APP_INSTANCE || 'master')}
===================================================`
                );
                console.log(`Max HTTP Header size is ${chalk.red(http.maxHeaderSize)}`);
            });
            module.exports = server;
        }
    } catch (error) {
    throw throwError(error, 'startApplication');
    }
}

startApplication();