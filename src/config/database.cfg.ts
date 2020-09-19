import { ConnectionOptions } from "typeorm";
import { GmodQuote } from "../api/entities/gmodQuotes.ent";
import { Committee } from "../api/entities/committee.ent";
import { Game } from "../api/entities/game.ent";
import { GameRep } from "../api/entities/gameRep.ent";

export namespace data
{
    export const port = parseInt(process.env.DB_PORT || "3306");
    export const host = process.env.DB_HOST;

    export const conenctionOptions : ConnectionOptions = {
        type: "mysql",
        host: host,
		port: port,
		database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        synchronize: true,
        //logging: ["info", "warn", "error"], <-- handled by "typeorm:info" etc in .env
        logger: "debug",
        entities: [ 
			GmodQuote,
			Committee,
			Game,
			GameRep
		],
        //migrations: [ __dirname + "/../api/data/site/migrations/**/*.mgr.{ts,js}" ],
        //subscribers: [ __dirname + "/../api/data/site/subscribers/**/*.sbs.{ts,js}" ]
    };
}