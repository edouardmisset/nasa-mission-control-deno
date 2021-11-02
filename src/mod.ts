import * as log from 'https://deno.land/std@0.113.0/log/mod.ts'
import { Application, send } from 'https://deno.land/x/oak@v9.0.1/mod.ts' // Or v5.0.0
// import { join } from 'https://deno.land/std@0.113.0/path/mod.ts' // Or v
import api from './api.ts'

const app = new Application()
const PORT = 8000

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler('INFO'),
  },
  loggers: {
    default: {
      level: 'INFO',
      handlers: ['console'],
    },
  },
})

// Error handling
app.addEventListener('error', event => {
  log.error(event.error)
})

// We try to execute all the next middleware in the chain
// and if an error pops it will be caught and treated (back and front)
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    log.error(err)
    ctx.response.body = 'Internal server error'
    throw err
  }
})

// Logger middleware
app.use(async (ctx, next) => {
  await next()
  const time = ctx.response.headers.get('X-Response-Time')
  log.info(`${ctx.request.method} ${ctx.request.url}: ${time}`)
})

// Performance mesuring middleware
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const delta = Date.now() - start
  ctx.response.headers.set('X-Response-Time', `${delta}ms`)
})

// Router
app.use(api.routes())
app.use(api.allowedMethods())

// Static file middleware
app.use(async ctx => {
  const filePath = ctx.request.url.pathname
  log.info(filePath)
  const fileWhitelist = [
    '/index.html',
    '/javascripts/script.js',
    '/stylesheets/style.css',
    '/images/favicon.png',
    '/videos/space.mp4',
  ]

  log.info('is included: ', fileWhitelist.includes(filePath))
  if (fileWhitelist.includes(filePath)) {
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
    })
  }
})

if (import.meta.main) {
  log.info(`Starting server on port ${PORT}...`)
  await app.listen({
    port: PORT,
  })
}
