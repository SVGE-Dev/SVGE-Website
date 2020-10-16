import * as express from 'express';
import { Express as ExpressApp } from "express-serve-static-core";
import * as hbs from 'express-handlebars';
import { SiteUser } from '../api/entities/siteUser.ent';


export namespace Handlebars
{
	const options : ExphbsOptions = { // may export later if needed but probs not
		extname: "hbs",
		defaultLayout: "layout",
		layoutsDir: "views/layouts",
		partialsDir: "views/partials",
		helpers: {
			eq: (v1 : any, v2 : any) => v1 === v2,
			ne: (v1 : any, v2 : any) => v1 !== v2,
			lt: (v1 : any, v2 : any) => v1 < v2,
			gt: (v1 : any, v2 : any) => v1 > v2,
			lte: (v1 : any, v2 : any) => v1 <= v2,
			gte: (v1 : any, v2 : any) => v1 >= v2,
			and() {
				return Array.prototype.every.call(arguments, Boolean);
			},
			or() {
				return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
			},
			multipleOf: (val : number, divider : number) => val % divider == 0,
			contains: (arr : any[], val : any) => !!arr ? arr.includes(val) : false,
			visibleUsers: (persons : {user : SiteUser}[], opts : any) => persons.filter((p) => p.user.show),
			b64: (title : string, url : string, opts : any) : string => {
				const oEmbed = {
					title: title,
					author_name: "Southampton Video Games and Esports Society",
					author_url: url,
					provider_name : "Southampton Video Games and Esports Society",
					provider_url: url
				};
				return Buffer.from(JSON.stringify(oEmbed)).toString("base64");
			}
		}
	};
	
	export const init = (app : ExpressApp) =>
	{
		app.engine("hbs", hbs(options)); // create handlebars engine
		app.set("view engine", "hbs"); // set handlebars engine as our view engine
		app.set("views", "views"); // set views folder
		app.use(express.static("public")); // static folder for css etc.
	};
}

