const Router = require('koa-router');
const auth = require('../../config/auth');

const router = new Router({
  prefix: '/admin',
});

router.all('*', auth.middleware.ensure());

module.exports = router;
