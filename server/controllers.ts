import Router from 'koa-router'
import { Db } from './model';
import moment from 'moment'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export const api = new Router();

function generateSalt() {
    const salt = crypto.randomBytes(32);
    return salt.toString('hex');
}

function encrypt(salt: string, password: string) {
    const hash = crypto.pbkdf2Sync(password, new Buffer(salt, 'hex'), 4096, 512, 'sha256');
    return salt + "$" + hash.toString('hex');
}

const auth = new Router();

auth.post('/register', async ctx => {
    const result = await Db.users.insertOne({
        email: ctx.body.email,
        passwordHash: encrypt(generateSalt(), ctx.body.password),
        nickName: ctx.body.nickName,
        lockoutEnd: moment.min().toDate(),
        userType: 'normal'
    });
    ctx.body = {
        result: 'succeed',
        id: result.insertedId
    }
});

auth.get('/token', async ctx => {
    const user = await Db.users.findOne({ email: ctx.body.email });
    if (!user) throw "Cannot find user : " + ctx.body.email;
    let [salt, password] = user.passwordHash.split('$');
    if (encrypt(salt, ctx.body.password) == password)
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

