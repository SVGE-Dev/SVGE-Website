import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { ExpressErrorMiddlewareInterface, ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { ErrorRender } from "../controllers/render_interfaces/ErrorRender";


type ExpressError = { httpCode : number, name : string, message : string };

const httpErrors : Record<number, {page_subtitle : string, info : string}> = 
{
	500: {
		page_subtitle: "Internal Server Error",
		info: "An internal server error has occured, which is probably our fault! \
		If possible, could you please let a member of our committee know as soon as possible!"
	},
	403: {
		page_subtitle: "Forbidden Error",
		info: "You are forbidden from accessing this page! \
		If you believe this to be a mistake then please let a member of the committee know."
	}
};

@Middleware({ type: "after" })
export class InternalServerErrorHandler implements ExpressErrorMiddlewareInterface
{
	error : ErrorRequestHandler = (err : ExpressError, req : Request, res : Response, next : NextFunction) =>
	{
		res.status(err.httpCode);
		console.error(err);

		if(req.headers.accept?.includes("text/html"))
		{
			const errorInfo : {page_subtitle : string, info? : string} = httpErrors[err.httpCode] || {page_subtitle: "Error"};
			const pageData : ErrorRender = {
				...errorInfo,
				page: err.httpCode.toString(),
				tab_title: `SVGE | ${err.httpCode}`,
				page_title: err.httpCode.toString()
			};

			res.render("error", pageData);
		}
	}
}

@Middleware({ type: "after" })
export class NotFoundErrorHandler implements ExpressMiddlewareInterface
{
	use : RequestHandler = (req : Request, res : Response, next : NextFunction) =>
	{
		if(!req.route) // not found
		{
			res.status(404);
			if(req.headers.accept?.includes("text/html"))
			{
				const pageData : ErrorRender = {
					page: "404",
					tab_title: "SVGE | 404",
					page_title: "404",
					page_subtitle: "Page Not Found",
					info: "This page could not be found. If you typed in a URL to get here then please ensure you typed it\
					correctly. If you clicked a link on the site then please join our Discord and let a member of the\
					committee know that there's a hyperlinks issue!"
				};
				res.render("error", pageData);
			}
		}
	}
}