import Router from 'koa-router'

export const api = new Router();

api.get("/test", ctx => ctx.body = "Hello World!")

