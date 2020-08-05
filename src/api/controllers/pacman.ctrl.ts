import { Controller, Render, Get } from "routing-controllers";


@Controller("/pacman")
export class PacmanController
{
    @Get("/")
    @Render("pacman")
    private async pacman()
    {
        return {
            layout: false,
            tab_title: "SVGE | Pacman Easter Egg",
        };
    }
}