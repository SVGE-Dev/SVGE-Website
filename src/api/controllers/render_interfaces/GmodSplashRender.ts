import { RenderResponse } from "./RenderResponse";

export interface GmodSplashRender extends RenderResponse
{
	mapName : string;
	steamId : string;

	quote : string;
	quote_author : string;
	screenshot : string;
	stats : string;
}