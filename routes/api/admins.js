const Router = require('koa-router');
const bcrypt = require('bcrypt');

const db = require('../../lib/db');
const auth = require('../../lib/auth');

const router = new Router({
  prefix: '/admins',
});

router.use(auth.middleware.ensure());

router.get('/', async ctx => {
  const query = db('admins')
    .select('*')
    .orderBy('email', 'asc');
  const admins = await query;
  ctx.body = {
    ok: true,
    admins,
  };
});

router.post('/', async ctx => {
  const { email, password } = ctx.request.body;
  const hash = await bcrypt.hash(password, 10);
  await db('admins').insert({ email, password: hash });
  ctx.body = {
    ok: true,
  };
});

router.del('/:id', async ctx => {
  const { id } = ctx.params;
  await db('admins')
    .where('id', id)
    .del();
  ctx.body = {
    ok: true,
  };
});

module.exports = router;
