const passport = require('koa-passport')

const jwt = async (ctx, next) =>
  passport.authenticate('jwt', async (err, user) => {
    if (user) {
      ctx.state.user = user
      await next()
    } else {
      ctx.status = 403
      ctx.body = { ok: false, message: 'Missing or invalid token' }
    }
  })(ctx)

module.exports = {
  jwt: () => jwt,
}
