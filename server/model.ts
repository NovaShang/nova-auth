import { ObjectId, MongoClient, Db as MongoDb } from "mongodb";

export interface User {
    _id: ObjectId;
    email: string;
    nickName: string;
    passwordHash: string;
    lockoutEnd: Date;
    userType: "normal" | "admin";
}

export class Db {
    static db?: MongoDb;
    static async initDb() {
        const mongo = new MongoClient(process.env.MONGO!);
        await mongo.connect();
        this.db = mongo.db(process.env.DB ?? 'auth');
        await this.users.createIndex('email');
    }
    static get users() {
        return this.db!.collection<User>('users');
    }
}