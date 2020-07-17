import Koa from 'koa'
import koaStatic from 'koa-static'
import { api } from './controllers'
import { Db } from './model';
import bodyparser from 'koa-bodyparser';

async function run(port: number) {
    await Db.initDb();
    const app = new Koa();
    app.use(bodyparser())
    app.use(koaStatic('./dist'));
    app.use(api.routes());
    app.listen(port);
    console.log('Server running on port ' + port);
}

run(Number(process.env.PORT ?? '7917'))