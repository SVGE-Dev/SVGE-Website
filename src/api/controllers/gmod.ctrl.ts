import { Controller, Get, Render, Authorized, Post, QueryParam, QueryParams, UploadedFiles, UploadOptions } from "routing-controllers";
import { GmodQuote } from "../data/gmod/models/quotes.ent";
import { readdirSync } from "fs";
import { join, basename } from "path";
import { IsString } from "class-validator";
import * as Config from "../../config/_configs";
import { File } from "../../config/_configs";

// Jimp is a little retarded
import Jimp from 'jimp';
import { cropAndResize } from "../../utils/cropAndResize";
// tslint:disable-next-line: no-var-requires
const jimp : Jimp = require('jimp');



const uploadOptions : UploadOptions = {
    options: Config.Uploads.imgUploads,
    required: true
};

@Controller("/gmod-splash")
export class GmodSplashController
{
    SCREENSHOT_DIR = join(__dirname, "../../public/images/gmod");

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
        const randQuote = quotes[Math.floor(Math.random()*quotes.length)];

        // get a random screenshot
        const screenshots = readdirSync(this.SCREENSHOT_DIR);
        const screenshot = basename( screenshots[Math.floor( Math.random() * screenshots.length )] );
        
        return {
            layout: false,

            mapName: mapName || "mapname_here",
            steamId: parsedSteamInfoIdk || "6969",

            quote: randQuote.quote,
            quote_author: randQuote.author,
            screenshot: screenshot,
            stats: "Ollie needs to get writing some LUA :)"
        };
    }

    @Get("/edit")
    @Render("gmod-splash-edit")
    @Authorized(["GMod Rep", "Committee"])
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
    @Authorized(["GMod Rep", "Committee"])
    public async AddScreenshot(@UploadedFiles("newScreenshots", uploadOptions) files : File[])
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
    @Authorized(["GMod Rep", "Committee"])
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