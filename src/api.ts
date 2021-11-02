import { Router } from './deps.ts'
import * as planets from './models/planets.ts'
import * as launches from './models/launches.ts'

const router = new Router()

router.get('/', ctx => {
  ctx.response.body = `
88888b.  8888b. .d8888b  8888b.  
888 "88b    "88b88K         "88b 
888  888.d888888"Y8888b..d888888 
888  888888  888     X88888  888 
888  888"Y888888 88888P'"Y888888 
        Mission Control`
})

router.get('/planets', ctx => {
  // Simulating an error using the throw fct in the ctx
  // ctx.throw(404, `Sorry planets aren't available`)
  ctx.response.body = planets.getAllPlanets()
})

router.get('/launches', ctx => {
  ctx.response.body = launches.getAll()
})

router.get('/launches/:id', ctx => {
  if (ctx.params?.id) {
    const launch = launches.getOne(Number(ctx.params.id))
    if (launch) {
      ctx.response.body = launch
    } else {
      ctx.throw(400, `Launch with ID ${ctx.params.id} does not exist`)
    }
  }
})

router.post('/launches', async ctx => {
  const body = await ctx.request.body().value
  launches.addOne(body)
  ctx.response.body = { success: true }
  ctx.response.status = 201
})

router.delete('/launches/:id', ctx => {
  if (ctx.params?.id) {
    const result = launches.removeOne(Number(ctx.params.id))
    ctx.response.body = { success: result }
  }
})

export default router
