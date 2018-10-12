const Router = require('koa-router')
const send = require('koa-send')
const path = require('path')

const router = new Router()

router.get('/admin/*', async ctx => {
  await send(ctx, path.join(__dirname, '..', 'public', 'admin', 'index.html'))
})
router.use(require('./api').routes())

module.exports = router
