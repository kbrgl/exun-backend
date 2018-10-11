const http = require('http')
const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const views = require('koa-views')
const serve = require('koa-static')
const logger = require('koa-logger')
const router = require('./routes')

const app = new Koa()

if (app.env === 'development') {
  app.use(logger())
}
app.use(bodyparser())
app.use(views(`${__dirname}/views`))
app.use(router.routes())
app.use(serve('public'))

const server = http.createServer(app.callback())
module.exports = server
