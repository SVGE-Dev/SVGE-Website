import { Controller, CurrentUser, Get, Render } from "routing-controllers";
import { IndexRender } from "./render_interfaces/IndexRender";
import { Profile as DiscordProfile } from "passport-discord";

@Controller("/")
export class IndexController
{
    @Get("/")
    @Render("index")
    private async index(@CurrentUser({ required: false }) currentUser : DiscordProfile) : Promise<IndexRender>
    {
        return {
			page: "home",
            tab_title: "SVGE | Southampton Video Games and Esports Society",
            page_title: "Southampton",
			page_subtitle: "Video Games and Esports Society",
			buttons: [
				{ text: "Join us on Discord", link: "https://discord.gg/n5rC5Jy" },
				{ text: "Become a Member", link: "https://www.susu.org/groups/southampton-university-esports-society" }
			],
			user_logged_in: !!currentUser,
			canonical: `${process.env.DOMAIN || "https://svge.uk"}`,
			desc: "Southampton Video Games and Esports Society (SVGE) is the home of gaming at the University of Southampton. \
			We play everything from chill, casual games with some friends to ranked games and competitive tournaments, \
			on both PC and console.",
			ogImage: "/images/hero_bg_1.jpg"
        };
    }
}