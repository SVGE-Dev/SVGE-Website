import { Controller, Render, Get, UseBefore } from "routing-controllers";
import { NoSeoIndexing } from "../middlewares/NoSeoIndexing.mdlw";


@UseBefore(NoSeoIndexing)
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