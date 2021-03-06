import { Application, send, flags, log, Context } from './deps.ts'
import api from './api.ts'

const argPORT = flags.parse(Deno.args).port

const app = new Application()

const PORT = Number(argPORT) || 8080

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
app.use(async (ctx: Context, next) => {
  try {
    await next()
  } catch (err) {
    log.error(err)
    ctx.response.body = 'Internal server error'
    throw err
  }
})

// Logger middleware
app.use(async (ctx: Context, next): Promise<void> => {
  await next()
  const time = ctx.response.headers.get('X-Response-Time')
  log.info(`${ctx.request.method} ${ctx.request.url}: ${time}`)
})

// Performance mesuring middleware
app.use(async (ctx: Context, next): Promise<void> => {
  const start = Date.now()
  await next()
  const delta = Date.now() - start
  ctx.response.headers.set('X-Response-Time', `${delta}ms`)
})

// Router
app.use(api.routes())
app.use(api.allowedMethods())

// Static file middleware
app.use(async (ctx: Context): Promise<void> => {
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
