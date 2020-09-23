import { Request, Response } from "express";
import { ExpressMiddlewareInterface } from "routing-controllers";

type cb = (err? : any) => any;

export class NoSeoIndexing implements ExpressMiddlewareInterface
{
	use(req : Request, res : Response, next? : cb) : any
	{
        res.setHeader("X-Robots-Tag", "noindex");
        next();
    }

}