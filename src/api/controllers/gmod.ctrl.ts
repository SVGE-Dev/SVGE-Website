import { Controller, Get, Render, Authorized, Post, QueryParam, QueryParams, UploadedFiles, UploadOptions } from "routing-controllers";
import { GmodQuote } from "../data/gmod/models/quotes.ent";
import { readdirSync } from "fs";
import { join, basename } from "path";
import { IsString } from "class-validator";
import * as Config from "../../config/_configs";
import { File } from "../../config/_configs";

// Jimp is a little retarded
import Jimp from 'jimp';
import { Z_FILTERED } from "zlib";
// tslint:disable-next-line: no-var-requires
const jimp : Jimp = require('jimp');

const uploadOptions : UploadOptions = {
    options: Config.Uploads.gmodScreenshots,
    required: true
};

class GmodQuoteQuery
{
    @IsString()
    quote : string;

    @IsString()
    author : string;
}

const SC_WIDTH = 1280;
const SC_HEIGHT = 720;
const ASPECT_RATIO = SC_WIDTH / SC_HEIGHT;

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
    @Authorized("GMod Rep")
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
    @Authorized("GMod Rep")
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

        console.log("FINISHED!");
        return Promise.all(imageProcessing);
    }

    @Post("/edit/quote")
    @Authorized("GMod Rep")
    public async AddQuote(@QueryParams() q : any)
    {
        const quote = new GmodQuote();
        quote.quote =  q.quote;
        quote.author = q.author;

        return quote.save();
    }

    private async processFile(file : File)
    {
        let img = await jimp.read(file.buffer);
        const width = img.getWidth();
        const height = img.getHeight();
        const ar = width / height; // aspect ratio
        console.log(`Width: ${width}\nHeight: ${height}\nAspect Ratio: ${ar}\nDesired AR: ${ASPECT_RATIO}`);

        if(ar > ASPECT_RATIO) // image is wider/shorter AR than we want
        {
            console.log("FIRST");
            img = img.resize(jimp.AUTO, SC_HEIGHT);
            const newWidth = img.getWidth();
            img = img.crop(
                (width - SC_WIDTH) / 2, // x zero
                0, // y zero
                SC_WIDTH, // width
                SC_HEIGHT // height
            );
        }
        else // image is thinner/taller AR than we want
        {
            console.log("SECOND");
            img = img.resize(SC_WIDTH, jimp.AUTO);
            const newHeight = img.getHeight();
            console.log(`New height: ${newHeight}, new width: ${img.getWidth()}`);
            img = img.crop(
                0, // x zero
                (newHeight - SC_HEIGHT) / 2, // y zero
                SC_WIDTH, // width
                SC_HEIGHT // height
            );
        }

        const newName : string = file.originalname.replace(/ /g, '_');
        console.log(newName);
        img.write(join(this.SCREENSHOT_DIR, newName));
        return newName;
    }
}