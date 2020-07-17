import Router from 'koa-router'
import { Db } from './model';
import moment from 'moment'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export const api = new Router();

function generateSalt() {
    const salt = crypto.randomBytes(32);
    return salt.toString('base64');
}

function encrypt(salt: string, password: string) {
    const hash = crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 4096, 512, 'sha256');
    return salt + "$" + hash.toString('base64');
}

const auth = new Router();

auth.post('/register', async ctx => {
    const body = ctx.request.body;
    console.log(body);
    const result = await Db.users.insertOne({
        email: body.email,
        passwordHash: encrypt(generateSalt(), body.password),
        nickName: body.nickName,
        lockoutEnd: moment.min().toDate(),
        userType: 'normal'
    });
    ctx.body = {
        result: 'succeed',
        id: result.insertedId
    }
});

auth.post('/token', async ctx => {
    const body = ctx.request.body;
    const user = await Db.users.findOne({ email: body.email });
    if (!user) throw "Cannot find user : " + body.email;
    let [salt, password] = user.passwordHash.split('$');
    if (encrypt(salt, body.password) == user.passwordHash)
        return jwt.sign({
            email: user.email,
            id: user._id,
            type: user.userType,
            name: user.nickName
        }, process.env.SECRET!)
    else
        throw "Wrong password";
})

api.use('/auth', auth.routes());

