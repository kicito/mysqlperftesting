const Router = require('koa-router');

const router = new Router();
const query = `SELECT * FROM finnomena_local.analytic_customer_event;`;

function queryTestData(ctx) {
  return new Promise((resolve, reject) => {
    ctx.connection.query(query, function(error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results.length);
      }
    });
  });
}

router.get('/', async function(ctx, next) {
  ctx.body = await queryTestData(ctx);
});

module.exports = router;
