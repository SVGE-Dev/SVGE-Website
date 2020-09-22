import { classToPlain } from "class-transformer";
import { Get, Render, Param, NotFoundError, Post, Put, Delete, Body, JsonController, UploadedFile } from "routing-controllers";
import { File, imgUploadOptions } from "../../config/_configs";
import { Game } from "../entities/game.ent";
import { NewUserRequest } from "./request_bodies/NewUserRequest";
import { UpdateUserRequest } from "./request_bodies/UpdateUserRequest";
import { NewUserResponse } from "./response_bodies/NewUserResponse";

@JsonController("/games")
export class GamesController
{
    @Get("/")
    @Render("games")
    private async games()
    {
		const games = await Game.find({
			select: [
				"url",
				"brief",
				"tagline",
				"nameShort"
			]
		});
		
        return {
			page: "games",
			tab_title: "SVGE | Games",
			page_title: "Our Games",
			page_subtitle: "Just some of the games we play at SVGE",
			games: games
        };
	}
	
	@Post("/")
	private async addGame()
	{

	}

	@Put("/")
	private async updateGame()
	{
		// remember to update the rep's "group" if the short name/URL has changed
	}

	@Delete("/")
	private async delGame()
	{
		// include deleting all reps
	}



    @Get("/:game")
    @Render("game")
    private async game(@Param("game") gameUrl : string)
    {
		const game = await Game.findOne({
			where: {
				url: gameUrl
			}
		});

		if(!game)
		{
			throw new NotFoundError("That game page does not exist.");
		}


        return {
			page: "games",
			tab_title: `SVGE | ${game.nameShort}`,
			page_title: game.name,
			gameInfo : classToPlain(game)
		};
	}
	
	@Post("/:game/rep")
	
	private async addRep(
		@Param("game") gameUrl : string,
		@Body() newUser : NewUserRequest,
        //@CurrentUser() user : DiscordProfile,
		@UploadedFile("avatar", { required: false, options: imgUploadOptions }) avatar : File)
		//: Promise<NewUserResponse>
	{
		console.log(newUser);
		return {};
	}

	@Put("/:game/rep")
	private async updateRep(
		@Param("game") gameUrl : string,
		@Body() user : UpdateUserRequest,
        //@CurrentUser() user : DiscordProfile,
		@UploadedFile("avatar", { required: false, options: imgUploadOptions }) avatar : File)
	{

	}

	@Delete("/:game/rep")
	private async delRep(@Param("game") gameUrl : string)
	{

	}
}