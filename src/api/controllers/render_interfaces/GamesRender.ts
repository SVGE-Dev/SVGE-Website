import { Game } from "../../entities/game.ent";
import { RenderRequest } from "./RenderRequest";

export interface GamesRender extends RenderRequest
{
	games : Array<{
		game : Game,
		icon : string // base64 encoding, Handlebars doesn't like getters
	}>;
	canEditAll : boolean;
	canEditSome : string[]; // UUIDs of games that this user can edit the info for
}