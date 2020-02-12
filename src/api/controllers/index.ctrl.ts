import { Controller, Get, Render } from "routing-controllers";

//@Controller("/")
export class IndexController
{
    @Get("/")
    @Render("index")
    private async index()
    {
        return {
            tab_title: "SVGE | Home",
            page_title: "Southampton",
            page_subtitle: "Video Games and Esports Society",
            button_text: "Join us on Discord"
        };
    }
}