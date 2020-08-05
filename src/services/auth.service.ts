import { Express as ExpressApp} from "express-serve-static-core";
import { Strategy as DiscordStrategy } from 'passport-discord';
import * as passport from 'passport';
import cookieSession = require('cookie-session');
import { Action } from "routing-controllers";
import { VerifyCallback } from 'passport-oauth2';
import { Profile as DiscordProfile } from 'passport-discord';
import { Request } from "express";
import { DiscordBot } from "./bot.service";

const debug = require('debug')("auth");



export namespace Auth
{
	export const init = (app : ExpressApp) =>
	{
		passport.use(
			new DiscordStrategy({
				clientID: process.env.DISCORD_CLIENT_ID!,
				clientSecret: process.env.DISCORD_CLIENT_SECRET!,
				callbackURL: '/auth/redirect',
				scope: [ "identify" ]
			},
			(accessToken : string, refreshToken : string, profile : DiscordProfile, done : VerifyCallback) => {
				debug(`${profile.username}#${profile.discriminator} has logged in.`);
				done(null, profile); // req.route can be accessed though the req.authInfo in the callbackURL route
			})
		);

		passport.serializeUser((profile : any, done : any) =>
		{
			const user : any = JSON.stringify(profile);
			done(null, user);
		});

		passport.deserializeUser((user : any, done : any) =>
		{
			const profile = JSON.parse(user) as DiscordProfile;
			done(null, profile);
		});
		
		app.use(cookieSession({
			maxAge: 24 * 3600 * 1000, // one day in milliseconds
			secret: process.env.SESSION_KEY,
		}));

		app.use(passport.initialize());
    	app.use(passport.session());
	};

	export const authCheck = (action : Action, roles : string[]) => new Promise<boolean>((resolve, reject) =>
	{
		if(action.request.user)
		{
			const user : DiscordStrategy.Profile = action.request.user;
			const allowed = DiscordBot.Utils.CheckForRole(
				user.id, process.env.DISCORD_GUILD_ID!, roles
			);
			resolve(allowed);
		}
		else
		{
			const req = action.request as Request;
			req.session!.oauth2return = req.route.path;

			passport.authenticate('discord', {}, (err : Error, user : DiscordProfile) =>
			{
				if (err) return reject(err);
				action.request.user = user;

				const allowed = DiscordBot.Utils.CheckForRole(
					user.id, process.env.DISCORD_GUILD_ID!, roles
				);
				return resolve(allowed);

			})(action.request, action.response, action.next);
		}
	});

	export const userCheck = (action : Action) => action.request.user;
}