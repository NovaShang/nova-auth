import Router from 'koa-router'

export const api = new Router();

api.get("/auth/test", ctx => ctx.body = "Hello World!")

