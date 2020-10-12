import { RenderResponse } from "./RenderResponse";

export interface IndexRender extends RenderResponse
{
	buttons? : Array<{
		text : string;
		link : string;
	}>;
}