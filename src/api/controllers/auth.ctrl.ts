import { Controller, Get, UseBefore, Redirect, Req, CurrentUser, Res, Authorized, Param, QueryParam } from 'routing-controllers';
import { Profile as DiscordProfile } from 'passport-discord';
import * as passport from 'passport';
import { Request, Response } from 'express';

const debugAuth = require('debug')("auth");
const debugRoutes = require('debug')("routes");



@Controller("/auth")
export class AuthController
{
	@Get("/login")
	@UseBefore(passport.authenticate("discord"))
	private async login(){}
	
	@Get("/redirect")
	@UseBefore(passport.authenticate("discord"))
	@Redirect("/")
	private async redirect(@CurrentUser() profile : DiscordProfile)
	{
		if(profile) debugAuth(`${profile.username}#${profile.discriminator} has logged in.`);
	}

	@Get("/logout")
	@Redirect("/")
	private async logout(@CurrentUser() profile : DiscordProfile, @Req() req : Request, @Res() res : Response)
	{
		if(profile)
		{
			debugAuth(`${profile.username}#${profile.discriminator} has logged out.`);
			req.logOut();
		}
	}
}