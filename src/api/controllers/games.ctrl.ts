import { Get, Render, Param } from "routing-controllers";

//@Controller("/games")
export class GamesController
{
    @Get("/")
    @Render("games")
    private games()
    {
        return {
            tab_title: "SVGE | Games"
        };
    }

    @Get("/:game")
    @Render("game")
    private game(@Param("game") game : string)
    {
        return {
            tab_title: `SVGE | ${game}`
        };
    }
}