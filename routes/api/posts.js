const Router = require('koa-router');

const db = require('../../lib/db');
const auth = require('../../lib/auth');
const notifications = require('../../lib/notifications');

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
  const { title, body, shouldPost, shouldNotify, isTest } = ctx.request.body;
  // Sanity check for isTest: if it's neither true nor false (e.g. it's undefined)
  // then make it true.
  // Cautious approach ensures
  if (isTest !== true && isTest !== false) {
    ctx.status = 400;
    ctx.body = {
      ok: false,
      message: `'isTest' parameter is neither true nor false, this is most likely a problem with the admin`,
    };
    return;
  }
  try {
    if (shouldPost) {
      await db('posts').insert({ title, body });
    }
    if (shouldNotify) {
      await notifications.push(
        title,
        body,
        // The following uses negation to ensure an undefined isTest parameter
        // does not cause a notification to be sent to all users.
        isTest ? [notifications.segments.TEST] : [notifications.segments.ALL],
      );
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      ok: false,
      message: `${err.name}: ${err.message}`,
    };
    return;
  }
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
