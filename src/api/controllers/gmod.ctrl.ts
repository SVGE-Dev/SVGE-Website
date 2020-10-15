import { Controller, Get, Render, Authorized, Post, QueryParam, QueryParams, UploadedFiles, UseBefore } from "routing-controllers";
import { GmodQuote } from "../entities/gmodQuotes.ent";
import { readdirSync } from "fs";
import { join, basename } from "path";
import { File, imgUploadOptions } from "../../config/_configs";

// Jimp is a little retarded
import Jimp from 'jimp';
// tslint:disable-next-line: no-var-requires
const jimp : Jimp = require('jimp');
import { cropAndResize } from "../../utils/cropAndResize";
import { NoSeoIndexing } from "../middlewares/NoSeoIndexing.mdlw";



@Controller("/gmod-splash")
@UseBefore(NoSeoIndexing)
export class GmodSplashController
{
    SCREENSHOT_DIR = "public/images/gmod";

    @Get("/")
    @Render("gmod-splash")
    public async GetGmodSplash(@QueryParam("map") mapName : string, @QueryParam("steamid") steamId : string)
    {
        // parse steam ID:
        // https://wiki.facepunch.com/gmod/Loading_URL
        const parsedSteamInfoIdk = steamId;

        // get random quote
        const quotes = await GmodQuote.find({
            select: [ "quote", "author" ],
        });
        const randQuote = (!!quotes && quotes.length > 0) ? quotes[Math.floor(Math.random()*quotes.length)] : undefined;

        // get a random screenshot
        const screenshots = readdirSync(this.SCREENSHOT_DIR);
		const screenshot = (!!screenshots && screenshots.length > 0)
			? basename( screenshots[Math.floor( Math.random() * screenshots.length )])
			: "";
        
        return {
            mapName: mapName || "mapname_here",
            steamId: parsedSteamInfoIdk || "6969",

            quote: randQuote?.quote || "This is a quote",
            quote_author: randQuote?.author || "This is an author",
            screenshot: screenshot,
			stats: "Ollie needs to get writing some LUA :)",
			
            custom_scripts: [
				"/js/gmod/downlingFile.js",
				"/js/gmod/gameDetails.js",
				"/js/gmod/setFilesNeeded.js",
				"/js/gmod/setFilesTotal.js",
				"/js/gmod/setStatusChanged.js",
			]
        };
    }

    @Get("/edit")
    @Render("gmod-splash-edit")
    @Authorized(["GMod Rep", process.env.COMMITTEE_ROLE_NAME, process.env.ADMIN_ROLE_NAME ])
    public async EditGmodSplash()
    {
        const quotes = (await GmodQuote.find()).map((gq) => { return {id: gq.id, quote: gq.quote, author: gq.author}; });
        const screenshots = readdirSync(this.SCREENSHOT_DIR).map((gs_path) => basename(gs_path));

        return {
            tab_title: "Edit GMod Splash",
            page_title: "Garry's Mod",
            page_subtitle: "Splash Screen Configurator",
            quotes: quotes,
            screenshots: screenshots
        };
    }

    @Post("/edit/screenshot")
    @Authorized(["GMod Rep", process.env.COMMITTEE_ROLE_NAME, process.env.ADMIN_ROLE_NAME ])
    public async AddScreenshot(@UploadedFiles("newScreenshots", { required: true, options: imgUploadOptions }) files : File[])
    {
        const imageProcessing = new Array<Promise<string>>();
        files.forEach(async (file : File) =>
        {
            if(file)
            {
                imageProcessing.push(this.processFile(file));
            }
            else
            {
                // throw an error? Idk
                // probably means Multer wouldn't accept the file for some reason
            }
        });

        return Promise.all(imageProcessing);
    }

    @Post("/edit/quote")
    @Authorized(["GMod Rep", process.env.COMMITTEE_ROLE_NAME, process.env.ADMIN_ROLE_NAME ])
    public async AddQuote(@QueryParams() q : any)
    {
        const quote = new GmodQuote();
        quote.quote =  q.quote;
        quote.author = q.author;

        return quote.save();
    }

    private async processFile(file : File)
    {
        const image = await cropAndResize(1280, 720, file.buffer);
        

        const newName : string = file.originalname.replace(/ /g, '_');
        image.write(join(this.SCREENSHOT_DIR, newName));
        return newName;
    }
}