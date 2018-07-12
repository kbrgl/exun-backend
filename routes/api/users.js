const db = require('../../config/db');
const auth = require('../../config/auth');
const Router = require('koa-router');
const router = new Router({
  prefix: '/users',
});

router.use(auth.middleware.ensure());

router.get('/', async ctx => {
  let query = db('users')
    .select('*')
    .orderBy('email', 'asc');
  if (ctx.query.admin === 'true') {
    query = query.where({ admin: 1 });
  }
  const users = await query;
  ctx.body = {
    ok: true,
    users,
  };
});

module.exports = router;
