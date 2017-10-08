require('dotenv').config();
const appDebug = require('debug')('application');
const Koa = require('koa');
const databaseConnection = require('./controllers/db');
const router = require('./routers');

async function startApplication(options = { mode: 'SC' }) {
  appDebug('initialize Koa instance');
  const app = new Koa();

  appDebug('configuring Koa instance');

  switch (options.mode) {
    case 'SC': {
      appDebug('Single DB Connection mode');

      app.use(async (ctx, next) => {
        const start = Date.now();
        ctx.connection = await databaseConnection.getConnection();
        await next();
        ctx.connection.end();
        const ms = Date.now() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
      });

      break;
    }
    case 'SPSC': {
      appDebug('Single DB Pool & Connection mode');

      app.use(async (ctx, next) => {
        const start = Date.now();
        // get pool
        ctx.connection = await databaseConnection.getPool();
        await next();
        // release pool
        ctx.connection.end();
        const ms = Date.now() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
      });

      break;
    }
    case 'SPMC': {
      appDebug('Single DB Pool, Multiple Connections mode');
      app.context.pool = await databaseConnection.getPool();

      app.use(async (ctx, next) => {
        const start = Date.now();
        // get pool
        ctx.connection = await databaseConnection.getConnectionFromPool(
          ctx.pool
        );
        await next();
        // release pool
        ctx.connection.release();
        const ms = Date.now() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
      });
      break;
    }
  }

  // // listen to onClose event
  // app.on('close', function() {
  //   appDebug('Server is closing');

  //   // app.connection.end();
  // });

  // // listen to SIGINT event
  // process.on('SIGINT', function() {
  //   appDebug('Server & Database conneciton is closing');

  //   // app.connection.end();
  // });

  // setup router
  app.use(router.routes());
  app.use(router.allowedMethods());

  return new Promise(resolve => {
    let server = app.listen(3000, () => {
      return resolve(server);
    });
  });
}
module.exports = startApplication;
