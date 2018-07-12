const Router = require('koa-router');

const router = new Router({
  prefix: '/api/v1',
});

router.get('/', ctx => {
  ctx.body = {
    ok: true,
    version: '1.0',
  };
});

router.use(require('./posts').routes());
router.use(require('./users').routes());

module.exports = router;
