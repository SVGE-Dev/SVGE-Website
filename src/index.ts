require('dotenv').config(); // inject values from .env into environment variables
import * as Configs from "./config/_configs";
import * as Services from "./services/_services";

const debug = require('debug')("startup");

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { useExpressServer } from 'routing-controllers';
import * as express from 'express';

// don't use routing-controllers's "createExpressServer" as routes should be done
// after auth and engine middlewares else it messes things up
const app = express();
Services.Handlebars.init(app);
Services.Auth.init(app);
Services.Logger.init(app); // log express with Morgan (must go after routes are setup)

debug(`Attempting to connect to database on ${Configs.data.host}:${Configs.data.port}...`);
createConnection(Configs.data.conenctionOptions)
    .then(async (connections) =>
    {
        debug(`Connected! Starting Discord bot...`);
        Services.DiscordBot.init();

        debug("Starting Express server...");
        const server = useExpressServer(app, Configs.server.settings).listen(Configs.server.port);
        debug(`Express server listening on port ${Configs.server.port}.`);        
    })
    .catch((error) =>
    {
        debug(error);
    });