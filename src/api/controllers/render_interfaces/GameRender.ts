import { Game } from "../../entities/game.ent";
import { UserManageableRender } from "./UserManageableRender";

export interface GameRender extends UserManageableRender // for reps
{
	game : Game;
	img : string; // base64 encoding, Handlebars doesn't like getters,
	canEditAll : boolean;
	canEditSelf : string | null; // their UUID
}