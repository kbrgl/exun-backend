const Router = require('koa-router');

const router = new Router();

router.use(require('./admin').routes());
router.use(require('./api').routes());

module.exports = router;
