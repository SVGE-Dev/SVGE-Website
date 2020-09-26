import { Profile as DiscordProfile } from "passport-discord";
import { File, imgUploadOptions } from "../../config/_configs";
import { DiscordBot } from "../../services/_services";
import { Game } from "../entities/game.ent";
import { SiteUser } from "../entities/siteUser.ent";
import { NoSeoIndexing } from "../middlewares/NoSeoIndexing.mdlw";
import { cropAndResize } from "../../utils/cropAndResize";
import { Request } from "express";
import {
	JsonController,
	Get,
	Post,
	Render,
	Param,
	Body,
	UploadedFile,
	CurrentUser,
	UseBefore,
	NotFoundError,
	ForbiddenError,
	BadRequestError, Req
} from "routing-controllers";
const multer = require('multer');

/*** Render Data ***/
import { GamesRender } from "./render_interfaces/GamesRender";
import { GameRender } from "./render_interfaces/GameRender";

/*** Request Bodies ***/
import { GameAddRequest } from "./request_bodies/GameAddRequest";
import { GameUpdateRequest } from "./request_bodies/GameUpdateRequest";
import { GameDeleteRequest } from "./request_bodies/GameDeleteRequest";
import { UserAddRequest } from "./request_bodies/UserAddRequest";
import { UserUpdateRequest } from "./request_bodies/UserUpdateRequest";
import { UserDeleteRequest } from "./request_bodies/UserDeleteRequest";

/*** Response Bodies ***/
import { GameAddResponse } from "./response_bodies/GameAddResponse";
import { GameUpdateResponse } from "./response_bodies/GameUpdateResponse";
import { GameDeleteResponse } from "./response_bodies/GameDeleteResponse";
import { UserAddResponse } from "./response_bodies/UserAddResponse";
import { UserUpdateResponse } from "./response_bodies/UserUpdateResponse";
import { UserDeleteResponse } from "./response_bodies/UserDeleteResponse";



@JsonController("/games")
export class GamesController
{
    @Get("/")
    @Render("games")
    private async games(
		@CurrentUser({ required: false}) currentUser : DiscordProfile)
		: Promise<GamesRender>
    {
		const games = await Game.find({
			select: [
				"url",
				"brief",
				"tagline",
				"nameShort",
				"icon"
			],
			order: {
				"position": "ASC"
			}
		});

		let isCommittee = false;
		let gamesUserIsRepFor : string[] = [];
		
		if(!!currentUser)
		{
			isCommittee = !!(await SiteUser.find({ group: "committee", discordId: currentUser.id }));

			if(!isCommittee)
			{
				const reps = games.map(async (g) =>
				{
					const rep = await SiteUser.findOne({ group: `${g.url}_reps`, discordId: currentUser.id });
					if(!rep) return null;
					return g.uuid;
				});

				gamesUserIsRepFor = (await Promise.all(reps)).filter((r) => !!r);
			}
		}
		
        return {
			page: "games",
			tab_title: "SVGE | Games",
			page_title: "Our Games",
			page_subtitle: "Just some of the games we play at SVGE",
			games: games.map((g) =>
			{
				return {
					game: g,
					icon: g.iconBase64
				};
			}),
			canEditAll: isCommittee,
			canEditSome: gamesUserIsRepFor
        };
	}
	
	@Post("/")
	// janky work around because Routing Controllers doesn't yet allow mutliple file upload fields
	@UseBefore(multer(imgUploadOptions).fields([
		{ maxCount: 1, name: "img"},
		{ maxCount: 1, name: "icon"}
	]))
	private async addGame(
		@Body() newGame : GameAddRequest,
        //@CurrentUser({ required: true }) user : DiscordProfile
		@Req() req : Request)
	: Promise<GameAddResponse>
	{
		// const siteUser = await SiteUser.findFromProfile(user, "committee");
		// if(!siteUser) throw new ForbiddenError("You are not a member of the Society's main committee.");

		let game = await Game.findOne({
			where: [ // using array means "OR"
				{ name: newGame.name },
				{ nameShort: newGame.nameShort },
				{ url: newGame.nameShort.toLowerCase().replace(/ /g, "-") }
			]
		});
		if(game) throw new BadRequestError("That game already exists.");

		let img : File;
		let icon : File;

		try {
			img = req.files["img"][0];
			icon = req.files["icon"][0];
		}
		catch(e)
		{
			throw new BadRequestError("Images for the game icon and page image must be provided.");
		}

		const gameImage = await cropAndResize(1280, 720, img.buffer);
		const gameIcon = await cropAndResize(480, 480, icon.buffer);

		//@ts-ignore Ignoring the fact that we're not setting the ID (TypeORM will handle that for us)
		game = new Game();
		game.name = newGame.name,
		game.nameShort = newGame.nameShort,
		game.brief = newGame.brief,
		game.tagline = newGame.tagline,
		game.heading = newGame.heading,
		game.text = newGame.text,
		game.img = await gameImage.getBufferAsync(img.mimetype),
		game.icon = await gameIcon.getBufferAsync(img.mimetype);
		game.position = newGame.position;
		game.url = newGame.nameShort.toLowerCase().replace(/ /g, "-");
		game = await game.save();

		Game.reorder(game.uuid);

		return {
			uuid: game.uuid,
			nameShort: game.nameShort,
			brief: game.brief,
			tagline: game.tagline,
			icon: game.iconBase64
		};
	}

	@Post("/edit")
	// janky work around because Routing Controllers doesn't yet allow mutliple file upload fields
	@UseBefore(multer(imgUploadOptions).fields([
		{ maxCount: 1, name: "img"},
		{ maxCount: 1, name: "icon"}
	]))
	private async updateGame(
		@Body() gameUpdate : GameUpdateRequest,
		@Req() req : Request,
		@CurrentUser({ required: true }) currentUser : DiscordProfile)
		: Promise<GameUpdateResponse>
	{
		const usersInfoes = await SiteUser.findFromProfile(currentUser) as any as SiteUser[];
		if(!usersInfoes || usersInfoes.length == 0) throw new ForbiddenError("Your details do not exist on our system. Please stop probing our API.");

		const game = await Game.findOne({
			where: {
				uuid: gameUpdate.uuid
			}
		});
		if(!game) throw new NotFoundError("Game not found. Please stop probing our API.");

		const reps = await SiteUser.find({
			where: {
				group: `${game.url}_reps`
			},
			select: [
				"group",
				"discordId"
			]
		});

		if(!usersInfoes.find((u) => u.group == "committee") && !reps.find((r) => r.discordId == currentUser.id))
		{
			throw new ForbiddenError("You are not a committee member, nor are you the rep for this game!");
		}

		const img : File | undefined = req.files["img"][0];
		const icon : File | undefined = req.files["icon"][0];

		let gameChanged = false;
		let repsChanged = false;
		if(!!gameUpdate.name && game.name != gameUpdate.name)
		{
			game.name = gameUpdate.name;
			gameChanged = true;
		}
		if(!!gameUpdate.nameShort && game.nameShort != gameUpdate.nameShort)
		{
			game.nameShort = gameUpdate.nameShort;
			game.url = gameUpdate.nameShort.toLowerCase().replace(/ /g, "-");
			reps.forEach((rep) => rep.group = `${game.url}_reps`);
			gameChanged = true;
			repsChanged = true;
		}
		if(!!gameUpdate.brief && game.brief != gameUpdate.brief)
		{
			game.brief = gameUpdate.brief;
			gameChanged = true;
		}
		if(!!gameUpdate.tagline && game.tagline != gameUpdate.tagline)
		{
			game.tagline = gameUpdate.tagline;
			gameChanged = true;
		}
		if(!!gameUpdate.heading && game.heading != gameUpdate.heading)
		{
			game.heading = gameUpdate.heading;
			gameChanged = true;
		}
		if(!!gameUpdate.text && game.text != gameUpdate.text)
		{
			game.text = gameUpdate.text;
			gameChanged = true;
		}
		if(!!img)
		{
			game.img = await (await cropAndResize(1280, 720, img.buffer)).getBufferAsync(img.mimetype);
			gameChanged = true;
		}
		if(!!icon)
		{
			game.icon = await (await cropAndResize(480, 480, icon.buffer)).getBufferAsync(icon.mimetype);
			gameChanged = true;
		}
		if(gameChanged)
		{
			await game.save();
			if(!!gameUpdate.position && game.position != gameUpdate.position)
			{
				await Game.reorder(game.uuid);
			}
		}
		
		if(repsChanged)
		{
			await SiteUser.save(reps);
		}

		return {
			uuid: game.uuid,
			nameShort: game.nameShort,
			brief: game.brief,
			tagline: game.tagline,
			icon: game.iconBase64
		};
	}

	@Post("/del")
	private async delGame(
		@Body() gameDel : GameDeleteRequest,
		@CurrentUser({ required: true }) currentUser : DiscordProfile)
		: Promise<GameDeleteResponse>
	{
		// include deleting all reps
		// check they're committee
		const siteUser = await SiteUser.findFromProfile(currentUser, "committee");
		if(!siteUser) throw new ForbiddenError("You are not a member of the Society's main committee.");

		const game = await Game.findOne({
			where: {
				uuid: gameDel.uuid
			}
		});
		if(!game) throw new BadRequestError("That game does not exist.");

		const reps = await SiteUser.find({
			where: {
				group: `${game.url}_reps`
			}
		});

		await game.remove();
		await SiteUser.remove(reps);
		await Game.reorder();

		return {};
	}



    @Get("/:game")
	@Render("game")
	@UseBefore(NoSeoIndexing) // so they don't index info about the reps
    private async game(
		@Param("game") gameUrl : string,
		@CurrentUser({ required: false}) currentUser : DiscordProfile)
		: Promise<GameRender>
    {
		const game = await Game.findOne({
			where: {
				url: gameUrl.toLowerCase()
			},
			select: [
				"heading",
				"text",
				"img",
				"name",
				"nameShort",
				"url"
			]
		});

		if(!game)
		{
			throw new NotFoundError("That game page does not exist.");
		}

		const reps = await SiteUser.find({
			where: {
				group: `${game.url}_reps`
			},
			select: [
				"discordId",
				"avatar",
				"name",
				"discordUsername",
				"title",
				"desc",
				"message"
			],
			order: {
				position: "ASC"
			}
		});

		if(game.text.includes("<p>")) // they rep has used markup for this
		{
			game.text = game.text.replace("<p>", '<p class="lead">'); // make first paragraph the "lead" paragraph
		}
		else // they haven't, so we need to manually enclose in paragraph tags
		{
			game.text = `<p class="lead">${game.text}</p>`;
		}

		let isCommittee = false;
		let canEditSelf : string | null = null;
		if(!!currentUser)
		{
			isCommittee = !!(await SiteUser.find({ group: "committee", discordId: currentUser.id }));

			if(!isCommittee)
			{
				const rep = reps.find((r) => r.discordId == currentUser.id);
				canEditSelf = !!rep ? rep.uuid : null;
			}
		}

        return {
			page: "games",
			tab_title: `SVGE | ${game.nameShort}`,
			page_title: game.name,
			game: game,
			reps: reps.filter((r) => r.show).map((r) => ({rep: r, icon: r.avatarBase64})),
			img: game.imgBase64,
			canEditAll: isCommittee,
			canEditSelf: canEditSelf
		};
	}
	
	@Post("/:game/rep")
	private async addRep(
		@Param("game") gameUrl : string,
		@Body() newRep : UserAddRequest,
        //@CurrentUser({ required: true }) currentUser : DiscordProfile,
		@UploadedFile("avatar", { required: false, options: imgUploadOptions }) avatar : File)
		: Promise<UserAddResponse>
	{
		const game = await Game.findOne({ url: gameUrl });
		if(!game) throw new NotFoundError("That game does not exist. Please stop probing our API.");

		const repProfile = DiscordBot.Utils.getGuildMemberFromName(newRep.username);
		let rep = await SiteUser.findOne({
			where: {
				discordId: repProfile.user.id,
				group: `${gameUrl}_reps`
			}
		});
		if(!!rep) throw new BadRequestError("That user is already a rep for this game.");

		const group = `${gameUrl}_reps`;

		rep = await new SiteUser().newUser(newRep, avatar, group, repProfile.id);
		rep = await rep.save();

		await SiteUser.reorder(group, rep.uuid);

		return {
			uuid : rep.uuid,
			discordUsername : rep.discordUsername,
			name : rep.name,
			position : rep.position,
			title : rep.title,
			desc : rep.desc,
			message : rep.message,
			avatarBase64 : rep.avatarBase64
		};
	}

	@Post("/:game/rep/edit")
	private async updateRep(
		@Param("game") gameUrl : string,
		@Body() repUpdate : UserUpdateRequest,
        @CurrentUser({ required: true }) currentUser : DiscordProfile,
		@UploadedFile("avatar", { required: false, options: imgUploadOptions }) avatar : File)
		: Promise<UserUpdateResponse>
	{
		const users = await SiteUser.findFromProfile(currentUser) as any as SiteUser[];
		if(!users || users.length == 0) throw new ForbiddenError("Your details do not exist on our system. Please stop probing our API.");

		const game = await Game.findOne({
			where: {
				url: gameUrl
			},
			select: [
				"url"
			]
		});
		if(!game) throw new NotFoundError("Game not found. Please stop probing our API.");

		const rep = await SiteUser.findOne({
			where: {
				group: `${game.url}_reps`,
				uuid: repUpdate.uuid
			}
		});
		if(!rep) throw new BadRequestError("That rep does not exist for this game. Please stop probing our API.");

		const isCommittee = !!users.find((u) => u.group == "committee");
		const isSelf = rep.discordId == currentUser.id;

		if(!isCommittee && !isSelf) throw new ForbiddenError("You are not a member of the committee nor the owner of this rep position. Please stop probing our API.");

		// could move this lot into the SiteUser class
		let changed = false;
		if(!!repUpdate.name && rep.name != repUpdate.name)
		{
			changed = true;
			rep.name = repUpdate.name;
		}
		let positionChanged = false;
		if(!!repUpdate.position && rep.position != repUpdate.position)
		{
			changed = true;
			positionChanged = true;
			rep.position = repUpdate.position;
		}
		if(!!repUpdate.title && rep.title != repUpdate.title)
		{
			changed = true;
			rep.title = repUpdate.title;
		}
		if(!!repUpdate.desc && rep.desc != repUpdate.desc)
		{
			changed = true;
			rep.desc = repUpdate.desc;
		}
		if(!!repUpdate.message && rep.message != repUpdate.message)
		{
			changed = true;
			rep.message = repUpdate.message;
		}
		if(repUpdate.resetAvatar)
		{
			if(rep.avatarIsCustom)
			{
				changed = true;
				await rep.setAvatar(); // reset it
			}
		}
		else
		{
			if(!!avatar)
			{
				changed = true;
				await rep.setAvatar(avatar);
			}
		}

		if(changed)
		{
			await rep.save();
			if(positionChanged)
			{
				await SiteUser.reorder(`${game.url}_reps`, rep.uuid);
			}
		}

		return {
			uuid: rep.uuid,
			discordUsername: rep.discordUsername,
			name: rep.name,
			position: rep.position,
			title: rep.title,
			desc: rep.desc,
			message: rep.message,
			avatarBase64: rep.avatarBase64
		};
	}

	@Post("/:game/rep/del")
	private async delRep(
		@Param("game") gameUrl : string,
		@Body() rep : UserDeleteRequest,
		@CurrentUser({ required: false }) currentUser : DiscordProfile)
		: Promise<UserDeleteResponse>
	{
		// check they're committee
		const siteUser = await SiteUser.findFromProfile(currentUser, "committee");
		if(!siteUser) throw new ForbiddenError("You are not a member of the Society's main committee.");

		const repEntity = await SiteUser.findOne({
			where: {
				group: `${gameUrl}_reps`,
				uuid: rep.uuid
			}
		});
		if(!repEntity) throw new NotFoundError("Failed to find the rep you wish to delete. Please stop probing our API.");

		await repEntity.remove();
		await SiteUser.reorder(`${gameUrl}_reps`);

		return;
	}
}