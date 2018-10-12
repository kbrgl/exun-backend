const Router = require('koa-router')
const passport = require('koa-passport')
const jwt = require('jsonwebtoken')

const router = new Router({
  prefix: '/auth',
})

router.post('/', async ctx =>
  passport.authenticate('local', (err, user) => {
    if (user) {
      const token = jwt.sign({}, process.env.SECRET, {
        subject: `${user.id}`,
      })
      ctx.body = {
        ok: true,
        token,
      }
    } else {
      ctx.status = 403
      ctx.body = { ok: false, message: 'Incorrect email or password' }
    }
  })(ctx),
)

module.exports = router
