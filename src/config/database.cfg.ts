import { ConnectionOptions } from "typeorm";

export namespace data
{
    export const port = parseInt(process.env.DB_PORT || "3306");
    export const host = process.env.DB_HOST;

    export const conenctionOptions : ConnectionOptions = {
        type: "mysql",
        host: host,
        port: port,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        synchronize: true,
        //logging: ["info", "warn", "error"], <-- handled by "typeorm:info" etc in .env
        logger: "debug",
        entities: [ __dirname + "/../api/data/**/models/*.ent.{ts,js}" ],
        //migrations: [ __dirname + "/../api/data/site/migrations/**/*.ent.{ts,js}" ],
        //subscribers: [ __dirname + "/../api/data/site/subscribers/**/*.ent.{ts,js}" ]
    };
}