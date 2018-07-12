const bcrypt = require('bcrypt');
const basicAuth = require('basic-auth');
const db = require('./db');

const auth = (module.exports = {
  async ensure(email, password) {
    let res = null;
    try {
      const user = await db
        .select('*')
        .from('users')
        .where('email', email)
        .first();
      const isCorrect = await bcrypt.compare(password, user.password);
      if (isCorrect) {
        res = user;
      }
    } finally {
      return res;
    }
  },
  middleware: {
    ensure() {
      return async function ensure(ctx, next) {
        const credentials = basicAuth(ctx);

        if (credentials) {
          const user = await auth.ensure(credentials.name, credentials.pass);
          if (user) {
            ctx.state.user = user;
            await next();
            return;
          }
        }
        ctx.status = 401;
        ctx.set('WWW-Authenticate', 'Basic realm="Authenticate"');
        ctx.body = { ok: false, message: 'Unauthorized' };
      };
    },
  },
});