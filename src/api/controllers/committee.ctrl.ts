import { JsonController, Get, Render, CurrentUser, InternalServerError, Post, Body, UploadedFile, UploadOptions, Authorized, NotFoundError } from "routing-controllers";
import { Profile as DiscordProfile } from 'passport-discord';
import { DiscordBot } from "../../services/_services";
import { Committee } from "../entities/committee.ent";
import { IsNumber, IsPositive, IsString, IsBoolean, IsUUID } from "class-validator";
import axios from "axios";
import { cropAndResize } from "../../utils/cropAndResize";
import * as Config from "../../config/_configs";
import { File, imgUploadOptions } from "../../config/_configs";



class PosInfo
{
    @IsUUID()
    id : string | null;

    @IsString()
    posName : string;

    @IsString()
    posDesc : string;

    @IsNumber()
    @IsPositive()
    posOrder : number;

    @IsBoolean()
    isMainCommitteePos : boolean;

    @IsString()
    username : string;

    @IsString()
    memberName : string;
}

class PosMemberInfo
{
    @IsUUID()
    id : string;

    @IsString()
    memberName : string | null;

    @IsString()
    posDesc : string | null;
}

@JsonController("/committee")
export class CommitteeController
{
    @Get("/")
    @Render("committee")
    private async index(@CurrentUser() user : DiscordProfile)
    {
        const committeePositions = await Committee.find({
            order: {
                posOrder: "ASC"
            }
		});
		const mainCommittee = committeePositions.filter((pos : Committee) => pos.isMainCommitteePos);
        const gamesCommittee = committeePositions.filter((pos) => !pos.isMainCommitteePos);

        const guild = DiscordBot.Utils.GetGuild(process.env.DISCORD_GUILD_ID);
        if(!guild)
        {
            throw new InternalServerError(`Guild with id ${process.env.DISCORD_GUILD_ID} not found.`);
		}
		
        const ownPositions = user ? committeePositions.filter((pos) => pos.PageInfo().user_id == user.id) : [];
        const isMainCommittee = user ? DiscordBot.Utils.CheckForRole(user.id, process.env.DISCORD_GUILD_ID, [process.env.COMMITTEE_ROLE_NAME]) : false;

        console.log(`Is main committee: ${isMainCommittee}`);

        return {
            tab_title: "SVGE | Committee",
            page_title: "Committee",
            page_subtitle: "Meet the SVGE Committee",
            is_main_committee: isMainCommittee,
            main_committee: mainCommittee.map((mc) => mc.PageInfo()),
            games_committee: gamesCommittee.map((gc) => gc.PageInfo()),
            own_poitions: ownPositions.map((op) => op.PageInfo()),
            custom_css: [ "/css/jquery-sortable.css" ],
            custom_scripts: [ "/js/jquery-sortable.js" ]
        };
    }

    @Post("/update-all")
    @Authorized(process.env.COMMITTEE_ROLE_NAME)
    private async UpdateAll(@Body() posInfoes : PosInfo[] )
    {
        console.log("Updating all");
        const jobs = new Array<Promise<Committee>>();

        posInfoes.forEach(async (posInfo) =>
        {
            if(posInfo.id == null)
            {   
                console.log("Creating new committee position...");
                const newCommPos = new Committee();
                newCommPos.posName = posInfo.posName;
                newCommPos.posDesc = posInfo.posDesc;
                newCommPos.posOrder = posInfo.posOrder;
                newCommPos.isMainCommitteePos = posInfo.isMainCommitteePos;
                newCommPos.memberName = posInfo.memberName;

                const user = DiscordBot.Utils.GetUserFromName(posInfo.username);
                if(!user) return; // some error happened, probably means user isn't in the guild

                const job = async () =>
                {
                    newCommPos.discordId = user.id;
                    newCommPos.username = `${user.username}#${user.discriminator}`;
                    newCommPos.customAvatar = false;

                    const res = await axios.get(user.avatarURL, { responseType: "arraybuffer" });
                    const imgBuffer = Buffer.from(res.data, "utf-8");
                    const img = await cropAndResize(2048, 2048, imgBuffer);
                    newCommPos.avatar = await img.getBufferAsync("image/png");

                    return newCommPos;
                };
                jobs.push(job());
            }
            else
            {
                console.log("Updating committee position...");
                const commPos = await Committee.findOne(posInfo.id);
                if(!commPos) return; // should probably throw an error here

                commPos.posName = posInfo.posName; 
                commPos.posDesc = posInfo.posDesc;
                commPos.posOrder = posInfo.posOrder;
                commPos.isMainCommitteePos = posInfo.isMainCommitteePos;
                commPos.memberName = posInfo.memberName;
                
                const user = DiscordBot.Utils.GetUserFromName(posInfo.username);
                if(!user) return; // throw some error? Return some more info so you can get a big red X?
                
                const job = async () =>
                {
                    if(commPos.discordId != user.id)
                    {
                        commPos.discordId = user.id;
                        commPos.username = `${user.username}#${user.discriminator}`;
                        commPos.customAvatar = false;
                        const res = await axios.get(user.avatarURL, { responseType: "arraybuffer" });
                        const imgBuffer = Buffer.from(res.data, "utf-8");
                        const img = await cropAndResize(2048, 2048, imgBuffer);
                        commPos.avatar = await img.getBufferAsync("image/png");
                    }
                    return commPos;
                };
                jobs.push(job());
            }
        });

        const committee = await Promise.all(jobs);
        console.log(`Number of positions: ${committee.length}`);
        await Committee.save(committee);
        return {};
    }

    @Post("/update-self")
    private async UpdateSelf(
        @Body() info : PosMemberInfo,
        //@CurrentUser() user : DiscordProfile,
        @UploadedFile("avatar", { required: false, options: imgUploadOptions }) newAvatar : File) // change this from "any" at some point
    {
        const pos = await Committee.findOne(info.id);
        if(!pos)
        {
			// sent a request with an id that doesn't exist, probably something shifty here
			throw new NotFoundError("There is no committee member with this id");
        }

        // if(pos.discordId != user.id)
        // {
        //     throw new ForbiddenError("This committee position is not yours to edit!");
        // }


        pos.memberName = info.memberName;
        pos.posDesc = info.posDesc;
        if(newAvatar)
        {
            pos.customAvatar = true;
            const avatar = await cropAndResize(2048, 2048, newAvatar.buffer);
            pos.avatar = await avatar.getBufferAsync(newAvatar.mimetype);
            
        }

        await pos.save();

        return {};
    }
}

