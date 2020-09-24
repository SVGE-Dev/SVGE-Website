import { Game } from "../../entities/game.ent";
import { SiteUser } from "../../entities/siteUser.ent";
import { RenderRequest } from "./RenderRequest";

export interface GameRender extends RenderRequest
{
	game : Game;
	reps : Array<SiteUser>;
	img : string; // base64 encoding, Handlebars doesn't like getters,
	canEditAll : boolean;
	canEditSelf : string | null; // their UUID
}