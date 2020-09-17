import { Get, Render, Param, Controller } from "routing-controllers";

@Controller("/games")
export class GamesController
{
    @Get("/")
    @Render("games")
    private games()
    {
        return {
			tab_title: "SVGE | Games",
			page_title: "Our Games",
            page_subtitle: "Just some of the games we play at SVGE"
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