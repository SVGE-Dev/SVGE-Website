import { Get, Render, Authorized, Post, QueryParam, UploadedFiles, UseBefore, Body, JsonController, UploadedFile, Redirect } from "routing-controllers";
import { GmodQuote } from "../entities/gmodQuote.ent";
import { File, imgUploadOptions } from "../../config/_configs";

// Jimp is a little retarded
import Jimp from 'jimp';
// tslint:disable-next-line: no-var-requires
const jimp : Jimp = require('jimp');
import { NoSeoIndexing } from "../middlewares/NoSeoIndexing.mdlw";
import { GmodImage } from "../entities/gmodImage.ent";
import { GmodSplashRender } from "./render_interfaces/GmodSplashRender";
import { GmodSplashEditRender } from "./render_interfaces/GmodSplashEditRender";
import { GmodQuoteAddRequest } from "./request_bodies/GmodQuoteAddRequest";



@JsonController("/gmod-splash")
@UseBefore(NoSeoIndexing)
export class GmodSplashController
{
    SCREENSHOT_DIR = "public/images/gmod";

    @Get("/")
    @Render("gmod-splash")
	public async GetGmodSplash(@QueryParam("map") mapName : string, @QueryParam("steamid") steamId : string) : Promise<GmodSplashRender>
    {
        // parse steam ID:
        // https://wiki.facepunch.com/gmod/Loading_URL
        const parsedSteamInfoIdk = steamId;

        // get random quote
        const quotes = await GmodQuote.find({
            select: [ "quote", "author" ],
        });
		const randQuote = (!!quotes && quotes.length > 0)
			? quotes[Math.floor(Math.random()*quotes.length)]
			: undefined;

        // get a random screenshot
        const screenshots = await GmodImage.find({
			select: [ "screenshot" ]
		});
		const randScreenshot = (!!screenshots && screenshots.length > 0)
			? screenshots[Math.floor(Math.random()*screenshots.length)].screenshotBase64
			: undefined;
        
        return {
			page: "gmod-splash",
			tab_title: "Garry's Mod Splash",
			page_title: "Garry's Mod Splash",

            mapName: mapName || "mapname_here",
            steamId: parsedSteamInfoIdk || "6969",

            quote: randQuote?.quote || "This is a quote",
            quote_author: randQuote?.author || "This is an author",
            screenshot: randScreenshot,
			stats: "Ollie needs to get writing some LUA :)",
			
            custom_scripts: [
				"/js/gmod/downloadingFile.js",
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
    public async EditGmodSplash() : Promise<GmodSplashEditRender>
    {
		const screenshots = await GmodImage.find();
		const quotes = await GmodQuote.find();

        return {
			page: "gmod-slash-configurator",
            tab_title: "GMod Splash Configurator",
            page_title: "Garry's Mod",
			page_subtitle: "Splash Screen Configurator",
			
            quotes: quotes,
            screenshots: screenshots.map((sc) => {
				return {
					uuid: sc.uuid,
					b64: sc.screenshotBase64
				};
			})
        };
    }

    @Post("/edit/screenshot")
	@Authorized(["GMod Rep", process.env.COMMITTEE_ROLE_NAME, process.env.ADMIN_ROLE_NAME ])
	@Redirect("/gmod-splash/edit")
    public async AddScreenshot(@UploadedFiles("newScreenshotFiles", { required: true, options: imgUploadOptions }) files : File[])
    {
		const screenshots = new Array<Promise<GmodImage>>();
		for(const file of files)
		{
			if(!!file) screenshots.push(GmodImage.Create(file)); 
		}

		return GmodImage.save(await Promise.all(screenshots));
    }

    @Post("/edit/quote")
	@Authorized(["GMod Rep", process.env.COMMITTEE_ROLE_NAME, process.env.ADMIN_ROLE_NAME ])
	@Redirect("/gmod-splash/edit")
    public async AddQuote(
		@Body() newQuote : GmodQuoteAddRequest,
		@UploadedFile("", {required: false}) f : File) // only needed so Routing Controllers sets up the route properly
    {
        const gmodQuote = new GmodQuote();
        gmodQuote.quote =  newQuote.quote;
        gmodQuote.author = newQuote.author;

        return gmodQuote.save();
    }
}