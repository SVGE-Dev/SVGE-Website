import { GmodQuote } from "../../entities/gmodQuote.ent";
import { RenderResponse } from "./RenderResponse";

export interface GmodSplashEditRender extends RenderResponse
{
	screenshots : Array<{
		uuid : string;
		image : string; // Handlebars doesn't like getters
	}>;

	quotes : GmodQuote[];
}