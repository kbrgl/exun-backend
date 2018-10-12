const Router = require('koa-router')
const bcrypt = require('bcrypt')

const auth = require('../../lib/auth')
const db = require('../../lib/db')

const router = new Router({
  prefix: '/admins',
})

router.use(auth.jwt())

router.get('/', async ctx => {
  const query = db('admins')
    .select('*')
    .orderBy('email', 'asc')
  const admins = await query
  ctx.body = {
    ok: true,
    admins,
  }
})

router.post('/', async ctx => {
  const { email, password } = ctx.request.body
  const hash = await bcrypt.hash(password, 10)
  const [id] = await db('admins').insert({ email, password: hash })
  const admin = await db('admins')
    .select('*')
    .where('id', id)
    .first()
  ctx.body = {
    ok: true,
    admin,
  }
})

router.del('/:id', async ctx => {
  const { id } = ctx.params
  await db('admins')
    .where('id', id)
    .del()
  ctx.body = {
    ok: true,
  }
})

module.exports = router
