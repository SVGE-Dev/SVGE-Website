import * as express from 'express';
import { Express as ExpressApp } from "express-serve-static-core";
import * as hbs from 'express-handlebars';
import * as path from 'path';



export namespace Handlebars
{
	const options : ExphbsOptions = { // may export later if needed but probs not
		extname: "hbs",
		defaultLayout: "layout",
		layoutsDir: path.join(__dirname, "../views/layouts"),
		partialsDir: path.join(__dirname, "../views/partials"),
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
		}
	};
	
	export const init = (app : ExpressApp) =>
	{
		app.engine("hbs", hbs(options)); // create handlebars engine
		app.set("view engine", "hbs"); // set handlebars engine as our view engine
		app.set("views", path.join(__dirname, "../views")); // set views folder
		app.use(express.static(path.join(__dirname, "../public"))); // static folder for css etc.
	};
}