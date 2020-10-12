import { Express as ExpressApp} from "express-serve-static-core";
import * as morgan from "morgan";
import * as chalk from "chalk";
import { Request, Response } from "express";



export namespace Logger
{
	export const init = (app : ExpressApp) =>
	{
		app.use(
			morgan((tokens : any, req : Request, res : Response) : string =>
			{
				const blue = "#2ed573";
				const yellow = "#f08400";
				const purple = "#2f78ed";
				const informationalColor = chalk.magenta.bold; // 100 "Informational" HTTP codes
				const successColor = chalk.green.bold; // 200 "Success" HTTP codes
				const redirectColor = chalk.hex(blue).bold; // 300 "Redirection" HTTP codes
				const clientFailColor = chalk.hex(yellow).bold; // 400 "Client Error" HTTP codes
				const serverFailColor = chalk.red.bold; // 500 "Server Error" HTTP codes
				const infoColor = chalk.hex(purple).bold;

				const status = tokens.status(req, res);
				const method = tokens.method(req, res);
				const endpoint = tokens.url(req, res);
				const resTime = tokens["response-time"](req, res) || 0;
				const title = [
					"[" + status + "]",
					method,
					endpoint,
					resTime + " ms"
				].join(" ");

				const statusCode = parseInt(status);
				const statusColor =
					(200 <= statusCode && statusCode < 300) ? successColor
					: (300 <= statusCode && statusCode < 400) ? redirectColor
					: (400 <= statusCode && statusCode < 500) ? clientFailColor
					: (500 <= statusCode) ? serverFailColor
					: informationalColor;

				const date = [
					"\n  time:",
					tokens.date(req, res)
				].join(" ");
				const from = [
					"\n  from:",
					tokens["remote-addr"](req, res),
					"-",
					tokens.referrer(req, res)
				].join(" ");
				const userAgent = [
					"\n  user-agent:",
					tokens["user-agent"](req, res)
				].join(" ");


				return [
					statusColor(title),
					infoColor(date),
					infoColor(from),
					infoColor(userAgent),
					"\n"
				].join(" ");
			})
		);
	};
}