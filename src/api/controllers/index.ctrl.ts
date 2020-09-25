import { Controller, Get, Render } from "routing-controllers";

@Controller("/")
export class IndexController
{
    @Get("/")
    @Render("index")
    private async index()
    {
        return {
			page: "home",
            tab_title: "SVGE | Home",
            page_title: "Southampton",
            page_subtitle: "Video Games and Esports Society"
        };
    }
}