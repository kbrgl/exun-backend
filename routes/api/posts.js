const db = require('../../lib/db');
const auth = require('../../lib/auth');
const Router = require('koa-router');
const router = new Router({
  prefix: '/posts',
});

router.get('/', async ctx => {
  const posts = await db('posts')
    .select('id', 'title', 'body', 'created_at', 'updated_at')
    .orderBy('updated_at', 'desc');
  ctx.body = {
    ok: true,
    posts,
  };
});

router.post('/', auth.middleware.ensure(), async ctx => {
  const { title, body } = ctx.request.body;
  await db('posts').insert({ title, body });
  ctx.body = {
    ok: true,
  };
});

router.del('/:id', auth.middleware.ensure(), async ctx => {
  const { id } = ctx.params;
  await db('posts')
    .where('id', id)
    .del();
  ctx.body = {
    ok: true,
  };
});

router.patch('/:id', auth.middleware.ensure(), async ctx => {
  const { id } = ctx.params;
  const { title, body } = ctx.request.body;
  await db('posts')
    .where('id', id)
    .update({ title, body });
  ctx.body = {
    ok: true,
  };
});

module.exports = router;
